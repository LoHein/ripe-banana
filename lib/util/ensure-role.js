module.exports = function(requiredRole) {
    return (req, res, next) => {
        
        const role = req.get('authorization');

        if(role !== requiredRole){
            next({
                status: 403,
                error: `requries ${requiredRole} role`
            });
        }
        else next();
    };
};