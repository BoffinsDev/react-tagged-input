/**
 * @jsx React.DOM
 */

var React = require('react'),
  TaggedInput = require('../src/TaggedInput.jsx'),
  mountPoint = document.querySelector('body');


function tagAdded (tag) {
  console.log(tag);
}

var arrays = ['melon', 'citrus', 'kiwi'];
//var mine = ['pear'];

setTimeout(function() {
  console.debug('works')
  arrays = ['peach', 'grapes', 'tomatoe'];
}, 3000);

var Test = React.createClass({
  getInitialState: function() {
    return { tags: ['test'] }
  },

  _add: function() {
    this.setState({ tags: arrays });
  },

  componentDidMount: function() {
    var ctx = this;
    setTimeout(function() {
      ctx._add();
    }, 2700);
  },

  render: function() {
    return (
      <TaggedInput
        statics={['apple', 'orange', 'banana']}
        addKeys={[TaggedInput.TAB]}
        removeKeys={[TaggedInput.BACKSPACE]}
        tags={this.state.tags}
        autofocus={true}
        backspaceDeletesWord={true}
        placeholder={'Name some fruits'}
        onAddTag={tagAdded}
        unique={true}
      />
    );
  }
});

React.render(<Test/>, mountPoint);
