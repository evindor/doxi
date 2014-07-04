var _ = require('underscore');

module.exports = function(rawData) {
    var data = rawData.reduce(function(res, cur) {
        return res.concat(cur);
    }, []);

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
