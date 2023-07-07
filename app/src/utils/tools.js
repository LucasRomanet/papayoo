const byId = (a, b) => { return a.id - b.id };
function byPoints(a, b) {return a.points - b.points};
function byGames(a, b) {return b.games - a.games};
function byScore(a, b) {return a.score - b.score};
function byAvg(a, b) {return a.score/a.games - b.score/b.games};

const nametag = (user) => {
    return `${user.name}#${user.tag}`;
};

const pointIntersects = (point, boundingRect) => {
    if (boundingRect.left > point.x || boundingRect.right < point.x) {
        return false;
    }

    if (boundingRect.top > point.y || boundingRect.bottom < point.y) {
        return false;
    }

    return true;
}
module.exports = { 
    byId, byPoints, byGames, byScore, byAvg,
    nametag, pointIntersects
};
