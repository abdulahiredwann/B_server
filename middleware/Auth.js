const jwt = require('jsonwebtoken');
const { Post } = require('../model/Post');
const { User } = require('../model/User');

function auth(req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).send('Access denied. No token provided.');

    try {
        const decoded = jwt.verify(token, process.env.jwtPrivateKey);
        req.user = decoded;
        next();
    } catch (ex) {
        res.status(400).send('Invalid token.');
    }
}
async function authorized(req, res, next){
    const post = await Post.findById(req.params.post_id);
    if (!post) return res.status(404).send('Post with the given ID not found.');

    if (!post.user || post.user.toString() !== req.user._id.toString()) {
        return res.status(403).send('Access denied. You are not the owner of this post.');
    }

    req.post = post; // Attach the post to the request object for further use
    next();
}

exports.auth = auth;
exports.authorized = authorized;