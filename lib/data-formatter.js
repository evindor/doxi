var _ = require('underscore')
  , hljs = require('highlight.js')
  , marked = require('marked');

var renderer = new marked.Renderer();

renderer.heading = function (text, level) {
  return '<h' + level + '>' + text + '</h' + level + '>\n';
};

renderer.paragraph = function (text) {
  return '<p>' + text + '</p>';
};

renderer.br = function () {
  return '<br />';
};

marked.setOptions({
  renderer: renderer
, gfm: true
, tables: true
, breaks: true
, pedantic: false
, sanitize: false
, smartLists: true
, smartypants: false
});

function getCommentName(comment) {
  var name = _.findWhere(comment.tags, {type: "name"});
  return name && name.string || comment.ctx && comment.ctx.name || "";
}

function getOneliner(comment) {
  var oneliner = _.findWhere(comment.tags, {type: "oneliner"});
  if (oneliner) {
    return hljs.highlight('javascript', oneliner.string).value;
  }
  return null;
}

function highlightExamples(comment) {
  comment.tags.forEach(function(tag) {
    if (tag.type === 'example') {
      tag.string = hljs.highlight('javascript', tag.string).value;
    }
  });
}

function hasTags(comment) {
  var hasTags = false;
  var tags = _.toArray(arguments).slice(1);
  comment.tags.forEach(function(tag) {
    if (_.contains(tags, tag.type)) {
      hasTags = true;
    }
  }); 
  return hasTags;
}

function processComment(comment) {
  comment.name = getCommentName(comment);
  /**
    * Used to display a pretty one-liner usage example near name. You can see the result just above these lines.
    *
    * @group Custom tags
    * @name @oneliner
    * @oneliner var foo = new Bar(1, "hello");
    */
  comment.oneliner = getOneliner(comment);
  comment.hasArguments = hasTags(comment, "param", "property");
  comment.hasReturns = hasTags(comment, "return", "returns");
  highlightExamples(comment);
  return comment;
}

function processComments(comments) {
  return comments.map(processComment);
}

function findIntroduction(comments) {
  var result = "";
  comments.forEach(function(comment) {
    var introduction = _.findWhere(comment.tags, {type: "introduction"});
    if (introduction) {
      result = result + "\n" + introduction.string;
    }
  });
  return marked(result);
}

module.exports = function(rawData) {
  var comments = processComments(_.flatten(rawData));
  /**
   * You can see the output of `@introduction` tag on top of this page. Use it to introduce your product, write a welcome text etc.
   * `@introduction` supports markdown and html.
   * It is advised to have only one `@inroduction`, however multiple `@introduction` tags will be joined in file name order.
   *
   * @group Custom tags
   * @name @introduction
   */
  var introduction = findIntroduction(comments);
  var groups = [];

  comments.map(function(item) {
    /**
     * Join comments from separate files into a single logical group.
     * Check the sidebar - "Custom tags", "Installation", "Options" and "Usage instructions" are all groups.
     *
     * @group Custom tags
     * @name @group
     */
    var groupTag = _.findWhere(item.tags, {type: "group"});
    var groupName = groupTag && groupTag.string || "";
    var group = _.findWhere(groups, {name: groupName});
    /**
     * Used to create a description for the group. You can use markdown, it will be shown right under group heading.
     *
     * @group Custom tags
     * @name @grouptext
     * @grouptext
     * [Doxi](https://github.com/evindor/doxi) introduces some custom JSDoc tags so you could manage how the documentation will be rendered.
     */
    var groupText = _.findWhere(item.tags, {type: "grouptext"});
    if (group) {
      group.items.push(item);
      if (groupText) {
        group.text = group.text + "\n" + marked(groupText.string);
      }
    } else {
      groups.push({name: groupName
                 , items: [item]
                 , text: groupText ? marked(groupText.string) : ''
      });
    }
  });

  // Sort groups alphabetically
  groups = _.sortBy(groups, function(group) {
    return group.name.toLowerCase();
  })

  // Sort items alphabetically
  groups.map(function(group) {
    group.items = _.sortBy(group.items, function(item) {
      return item.name.toLowerCase();
    });
  });

  return {
    comments: groups,
    introduction: introduction
  };
}
