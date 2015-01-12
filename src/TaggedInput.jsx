/**
 * @jsx React.DOM
 */

var React       = require('react');
var joinClasses = require('react/lib/joinClasses');


var DefaultTagComponent = React.createClass({
  render: function () {
    var self = this, p = self.props;

    return (
      <div className={joinClasses("tag", p.classes)}>
        <div className="tag-text">{p.item}</div>
        <div className="remove" onClick={p.onRemove}>
          {this.props.removeTagLabel}
        </div>
      </div>
    );
  }
});


// Non removable tags.
var StaticTagComponent = React.createClass({
  render: function () {
    var self = this, p = self.props;

    return (
      <div className={joinClasses("tag", 'static-tag', p.classes)}>
        <div className="tag-text">{p.item}</div>
        {/*<div className="remove" onClick={p.onRemove}>{this.props.removeTagLabel}</div>*/}
      </div>
    );
  }
});

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

  getInitialState: function () {
    return {
      statics:  this.props.statics || [],
      tags:     this.props.tags || [],
      unique:   this.props.unique || true,
      currentInput: null
    };
  },

  componentWillReceiveProps: function(next) {
    this.setState({ tags: next.tags });
  },

  render: function () {
    var self = this, s = self.state, p = self.props;

    var tagStaticComponents = [];

    var tagComponents = [];
    var classes = "tagged-input-wrapper";
    var placeholder;

    if (p.classes) {
      classes += ' ' + p.classes;
    }

    if (s.tags.length === 0) {
      placeholder = p.placeholder;
    }

    //var TagComponent = DefaultTagComponent;

    for (var i = 0; i < s.statics.length; i++) {
      tagStaticComponents.push(
        <StaticTagComponent
          item={s.statics[i]}
          key={s.statics[i]}
          itemIndex={i}
          //onRemove={self._handleRemoveTag.bind(this, i)}
          classes={p.unique && (i === s.duplicateStaticIdx) ? 'duplicate' : ''}
          //removeTagLabel={p.removeTagLabel || "\u00D7"}
        />
      );
    }

    for (var i = 0; i < s.tags.length; i++) {
      tagComponents.push(
        <DefaultTagComponent
          item={s.tags[i]}
          key={s.tags[i]}
          itemIndex={i}
          onRemove={self._handleRemoveTag.bind(this, i)}
          classes={p.unique && (i === s.duplicateIndex) ? 'duplicate' : ''}
          removeTagLabel={p.removeTagLabel || "\u00D7"}
        />
      );
    }

    var input = (
      <input type="text"
        className="tagged-input"
        ref="input"
        onKeyUp={this._handleKeyUp}
        onKeyDown={this._handleKeyDown}
        onChange={this._handleChange}
        value={s.currentInput}
        placeholder={placeholder}>
      </input>
    );

    return (
      <div className={classes} onClick={self._handleClickOnWrapper}>
        {tagStaticComponents}
        {tagComponents}
        {input}
      </div>
    );
  },

  // TODO: I dont see the usefulness of autofocusing.
  // Maybe move default tags and static tag generation to this method.
  componentDidMount: function () {
    var self = this, s = self.state, p = self.props;

    if (p.autofocus) {
      self.refs.input.getDOMNode().focus();
    }
  },

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
    this.refs.input.getDOMNode().focus();
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

