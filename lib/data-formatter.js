module.exports = function(data) {
    return data.reduce(function(res, cur) {
        return res.concat(cur);
    }, []);
}
