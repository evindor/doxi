var _ = require('underscore')
  , hljs = require('highlight.js');

function getCommentName(comment) {
  var name = _.findWhere(comment.tags, {type: "name"});
  return name && name.string || comment.ctx.name;
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
    var groupsItem = _.findWhere(groups, {name: groupName});
    if (groupsItem) {
      groupsItem.items.push(item);
    } else {
      groups.push({name: groupName, items: [item]});
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
