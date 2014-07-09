var _ = require('underscore')
  , hljs = require('highlight.js');

function getCommentName(comment) {
  var name = _.findWhere(comment.tags, {type: "name"});
  return name && name.string || comment.ctx.name;
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

function processComment(comment) {
  comment.name = getCommentName(comment);
  highlightExamples(comment);
  comment.oneliner = getOneliner(comment);
  return comment;
}

function processComments(comments) {
  return comments.map(processComment);
}

module.exports = function(rawData) {
  var data = rawData.reduce(function(res, cur) {
    return res.concat(cur);
  }, []);

  data = processComments(data);

  var groups = [];
  data.map(function(item) {
    var groupTag = _.findWhere(item.tags, {type: "group"});
    var groupName = groupTag && groupTag.string || "";
    var group = _.findWhere(groups, {name: groupName});
    var groupText = _.findWhere(item.tags, {type: "grouptext"});
    if (group) {
      group.items.push(item);
      if (groupText) {
        group.text = group.text + groupText;
      }
    } else {
      groups.push({name: groupName
                 , items: [item]
                 , text: groupText ? groupText.string : ''
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
      return item.ctx.name.toLowerCase();
    });
  });

  return groups;
}
