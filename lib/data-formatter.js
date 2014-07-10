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
  var introduction = findIntroduction(comments);
  var groups = [];

  comments.map(function(item) {
    var groupTag = _.findWhere(item.tags, {type: "group"});
    var groupName = groupTag && groupTag.string || "";
    var group = _.findWhere(groups, {name: groupName});
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
