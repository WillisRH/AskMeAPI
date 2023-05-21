var acceptedIps = process.env.ACCEPTEDIP
    ? process.env.ACCEPTEDIP.split(",")
    : null;

const checkIpMiddleware = (req, res, next) => {
    if (!acceptedIps) {
        return next(); // skip this middleware if ACCEPTEDIP is not defined
    }
    const ip = req.ip.replace(/[^0-9.]/g, "");
    if (acceptedIps.split(",").includes(ip)) {
        next(); // continue to the next middleware or route
    } else {
        res.status(403).send("Access Denied"); // return a 403 Forbidden response
        console.log(`[DENIED] Someone is pinged to this API! (${req.ip})`);
    }
};

module.exports = {
    checkIpMiddleware,
};
