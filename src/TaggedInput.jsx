/**
 * @jsx React.DOM
 */

var React       = require('react');
var joinClasses = require('react/lib/joinClasses');


var defaultClasses = {
  tag:        'tag',
  staticTag:  'static-tag',
  text:       'text',
  remove:     'remove'
};


/**
 * We want the possibility to pass static 
 * @class {@link React.createClass}
 * @param {React.props}
 *  classes {String}
 *  item {String}
 *  staticType {Boolean} - Pass true if the tag is static.
 *  onRemove
 *  removeTagLabel
 */
var Tag = React.createClass({
  render: function() {
    var klasses = !this.props.staticType ? defaultClasses.tag : defaultClasses.tag + ' ' + defaultClasses.staticTag;

    return (
      <mark className={joinClasses(klasses, this.props.classes)}>
        <span className="tag-text">{this.props.item}</span>
        {!this.props.staticType &&
          <button type="button" className="remove" onClick={this.props.onRemove}>
            {this.props.removeTagLabel}
          </button>
        }
      </mark>
    );
  }
});

// Default tag
/*var DefaultTagComponent = React.createClass({
  render: function () {
    return (
      <mark className={joinClasses("tag", this.props.classes)}>
        <span className="tag-text">{this.props.item}</span>
        <button type="button" className="remove" onClick={this.props.onRemove}>
          {this.props.removeTagLabel}
        </button>
      </mark>
    );
  }
});*/


// Static tag
/*var StaticTag = React.createClass({
  render: function () {
    return (
      <mark className={joinClasses("tag", 'static-tag', this.props.classes)}>
        <span className="tag-text">{this.props.item}</span>
      </mark>
    );
  }
});*/

var TaggedInput = React.createClass({

  propTypes: {
    onAddTag:     React.PropTypes.func,
    onRemoveTag:  React.PropTypes.func,
    onEnter:      React.PropTypes.func,
    unique:       React.PropTypes.bool,
    autofocus:    React.PropTypes.bool,
    backspaceDeletesWord: React.PropTypes.bool,
    placeholder:          React.PropTypes.string,
    removeTagLabel:       React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.object])
  },

  // @see {@link http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes}
  statics: {
    ENTER:      13,
    BACKSPACE:  8,
    TAB:        9,
    DELETE:     46,
    COMMA:      188
  },

  // TODO: currentInput => text or input or current
  getInitialState: function () {
    return {
      active:   false,
      statics:  this.props.statics || [],
      tags:     this.props.tags || [],
      unique:   this.props.unique || true,
      currentInput: null
    };
  },

  componentWillReceiveProps: function(next) {
    this.setState({ tags: next.tags, statics: next.statics });
  },

  render: function () {
    var self = this, s = self.state, p = self.props;

    var classes = "tagged-input-wrapper";
    var placeholder;

    if (p.classes) {
      classes += ' ' + p.classes;
    }

    if (s.tags.length === 0) {
      placeholder = p.placeholder;
    }

    var isActive = s.active ? 'active' : '';

    return (
      <div className={joinClasses(isActive, classes)} onBlur={self._handleBlur} onClick={self._handleClickOnWrapper}>

        {/* tag static */}
        {this.state.statics.map(function(value, idx) {
          return (
            <Tag
              staticType={true}
              item={this.state.statics[idx]}
              key={this.state.statics[idx]}
              itemIndex={idx}
              classes={this.props.unique && (idx === this.state.duplicateStaticIdx) ? 'duplicate' : ''}
            />
          );
        }, this)}

        {/* tags */}
        {this.state.tags.map(function(value, idx) {
          return (
            <Tag
              item={this.state.tags[idx]}
              key={this.state.tags[idx]}
              itemIndex={idx}
              onRemove={this._handleRemoveTag.bind(this, idx)}
              classes={this.props.unique && (idx === this.state.duplicateIndex) ? 'duplicate' : ''}
              removeTagLabel={this.props.removeTagLabel || "\u00D7"}
            />
          );
        }, this)}

        {/* input */}
        <input
          type="text"
          className="tagged-input"
          ref="input"
          onKeyUp={this._handleKeyUp}
          onKeyDown={this._handleKeyDown}
          onBlur={this._handleBlur}
          onFocus={this._inputFocus}
          onChange={this._handleChange}
          value={s.currentInput}
          placeholder={placeholder} />
      </div>
    );
  },

  _inputFocus: function() {
    this.setState({ active: true });
  },

  // TODO: I dont see the usefulness of autofocusing.
  //componentDidMount: function () {if (this.props.autofocus) { this.refs.input.getDOMNode().focus(); }},

  _handleRemoveTag: function (index) {
    var self = this, s = self.state, p = self.props;

    var removedItems = s.tags.splice(index, 1);
    var duplicateIndex;

    if (s.duplicateIndex) {
      self.setState({duplicateIndex: null}, function () {
        if (p.onRemoveTag) {
          p.onRemoveTag(removedItems[0]);
        }
      });
    } else {
      if (p.onRemoveTag) {
        p.onRemoveTag(removedItems[0]);
      }
      self.forceUpdate();
    }
  },

  _handleKeyUp: function (e) {
    var self = this, s = self.state, p = self.props;

    var enteredValue = e.target.value;

    switch (e.keyCode) {
      case this.constructor.ENTER:
        e.preventDefault();
        if (s.currentInput) {
          self._validateAndTag(s.currentInput, function (status) {
            if (p.onEnter) {
              p.onEnter(e, s.tags);
            }
          });
        }
        break;
    }
  },

  /*_handleKeyDown: function (e) {
    var self = this,
      s = self.state,
      p = self.props,
      poppedValue,
      newCurrentInput;

    switch (e.keyCode) {
      case KEY_CODES.BACKSPACE:
        if (!e.target.value || e.target.value.length < 0) {
          poppedValue = s.tags.pop();

          newCurrentInput = p.backspaceDeletesWord ? '' : poppedValue;

          this.setState({
            currentInput: newCurrentInput,
            duplicateIndex: null
          });
          if (p.onRemoveTag) {
            p.onRemoveTag(poppedValue);
          }
        }
        break;
    }
  },*/

  _handleKeyDown: function(evt) {
    var self = this, s = self.state, p = self.props;
    var key = evt.keyCode ? evt.keyCode : evt.which;

    // add tag
    var addKeyArray = p.addKeys;
    for (var i = 0; i < addKeyArray.length; i++) {
      if (key === addKeyArray[i] && s.currentInput) {
        evt.preventDefault();
        this._validateAndTag(s.currentInput, function(status) {
          if (p.onEnter) { p.onEnter(evt, s.tags); }
        });
      }
    }

    // remove tag
    var removeKeyArray = p.removeKeys;
    for (var i = 0; i < removeKeyArray.length; i++) {
      // Continue if key is in array and no input is present (since we want default functionality in that case)
      if (key === removeKeyArray[i] && (!evt.target.value || evt.target.value.length < 0)) {
        evt.preventDefault();
        var poppedValue = this.state.tags.pop();
        var newCurrentInput = this.props.backspaceDeletesWord ? '' : poppedValue;

        this.setState({
          currentInput: newCurrentInput,
          duplicateIndex: null
        });

        if (this.props.onRemoveTag) { p.onRemoveTag(poppedValue); }
      }
    }
  },

  _handleChange: function (e) {
    this.setState({
      duplicateIndex: null,
      duplicateStaticIdx: null,
      currentInput: e.target.value
    });
  },

  _handleClickOnWrapper: function (e) {
    this.setState({ active: true });
    this.refs.input.getDOMNode().focus();
  },

  _handleBlur: function() {
    this.setState({ active: false });
  },

  _validateAndTag: function (tagText, callback) {
    var self = this, s = self.state, p = self.props;

    if (tagText && tagText.length > 0) {
      var trimmedText = tagText.trim();

      // If props unique only.
      if (s.unique) {
        var duplicateIndex      = this.state.tags.indexOf(trimmedText);
        var duplicateStaticIdx  = this.state.statics.indexOf(trimmedText);

        // If not duplicate
        if (duplicateIndex === -1 && duplicateStaticIdx === -1) {
          s.tags.push(trimmedText);
          self.setState({
            currentInput: '',
            //duplicateIndex: null,
            //duplicateStaticIdx: null
          }, function () {
            if (p.onAddTag) {
              p.onAddTag(tagText);
            }
            if (callback) {
              callback(true);
            }
          });

        // If duplicate
        } else {
          if (duplicateIndex !== -1) {
            self.setState({duplicateIndex: duplicateIndex}, function () {if (callback) { callback(false); }});
          } else {
            self.setState({duplicateStaticIdx: duplicateStaticIdx}, function () {if (callback) { callback(false); }});
          }

        }

      } else {
        s.tags.push(trimmedText);
        self.setState({currentInput: ''}, function () {
          if (p.onAddTag) {
            p.onAddTag(tagText);
          }
          if (callback) {
            callback(true);
          }
        });
      }
    }
  },

  getTags: function () {
    return this.state.tags;
  },

  getEnteredText: function () {
    return this.state.currentInput;
  },

  getAllValues: function () {
    var self = this, s = this.state, p = this.props;

    if (s.currentInput && s.currentInput.length > 0) {
      return (this.state.tags.concat(s.currentInput));
    } else {
      return this.state.tags;
    }
  }

});

module.exports = TaggedInput;

