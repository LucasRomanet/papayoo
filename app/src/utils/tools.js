const nametag = (user) => {
    return `${user.name}#${user.tag}`;
};

const byId = (a, b) => { return a.id-b.id };

module.exports = { nametag, byId };
