# react-tagged-input

A react component that lets you enter text and converts them to tags.

See the component proptypes in the src/ directory any more options.

More docs and features are on the way. Pull requests are welcome.

---
### Install

```sh
npm install react-tagged-input
```

---

### Usage

To make give this component a proper look and feel, you will want to include the [these styles](https://github.com/tutorialhorizon/react-tagged-input/blob/master/examples/index.css) and namespace them appropriately using the `classes` property as shown below to customize them as per your liking.


```js
var React = require('react');
var TaggedInput = require('react-tagged-input');
var mountPoint = document.querySelector('body');

React.render(
  <TaggedInput
    statics={['the hulk', 'spiderman']} // static tags
    addKeys={[TaggedInput.TAB]} // Keys that add tags (Enter is default add)
    removeKeys={[TaggedInput.BACKSPACE]} // Keys that remove tags
    tabIdx={1}

    //autofocus={true} // Gives the component focus after it mounts
    backspaceDeletesWord={true} // false deletes one character at a time
    placeholder={'Your favorite npm modules'}
    tags={['javascript', 'react']} // pre-assigned tags
    onEnter={/*function*/}
    onAddTag={/*function*/} // argument - tag that was added
    onRemoveTag={/*function*/} // argument - tag that got removed
    unique={true} // Whether duplicate entries are allowed
    classes={'my-css-namespace'}
    removeTagLabel={"\u274C"} // Unicode of a symbol or an Object click to delete tags. Defaults to 'x'
  />,
  mountPoint );
```


---
###Dev

Before you begin editing the source component, just run the following grunt task that watches for your changes to the examples as well as the component.

```sh
grunt dev
```

## License

[MIT](LICENSE)
