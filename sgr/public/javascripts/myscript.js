let routes = {};
let templates = {};
var pageUrl = "" ;
var lskey = "" ;

let app_div = document.getElementById('app');

function home() {
    let div = document.createElement('div');
    let link = document.createElement('a');
    let cls = document.createAttribute('class');
    cls.value = "next";
    switch ( location.pathname ) {
        case '/' : 
            pageUrl = '/init';
            break ;
        case '/init' :
            pageUrl = '/inregistrare';
            break ;
        case '/inregistrare' :
            pageUrl = '/voucher';
            break ;
        case '/voucher' :
            pageUrl = '/statistica';
            break ;
        case '/statistica' :
            pageUrl = '/';
            break ;
    }
    link.href = pageUrl;
    link.innerHTML = "<b>Next &raquo;</b>";
    link.setAttributeNode(cls);
    div.appendChild(link);
    app_div.appendChild(div);
}

// define the routes
function route (path, template) {
    if (typeof template === 'function') {
        return routes[path] = template;
    }
    else if (typeof template === 'string') {
        return routes[path] = templates[template];
    } else {
        return;
    };
};

// template engine
function template (name, templateFunction) {
    return templates[name] = templateFunction;
};

// map a template to a route
template('home', function() {
    home();
});

// route to template mapping
route('/', 'home');

// detect and resolve the changes in the URL
function resolveRoute(route) {
    try {
        return routes[route];
    } catch (e) {
        throw new Error(`Route ${route} not found`);
    };
};

//  function that will retrieve the route from the URL hash and call the template function
function router() {
    let route = resolveRoute('/');
    route();
};

// listen for the load events
window.addEventListener('load', router);

function funcUC(xid, xvalue) {
    const x = document.getElementById(xid) ;
    x.value = x.value.toUpperCase() ;
    xvalue = x.value ;
}

function funcD(xid, xvalue) {
    const x = document.getElementById(xid)
    x.type = "text";
    x.value = new Date(x.value).toLocaleDateString("ro-RO");
    xvalue = x.value ;
}

function funcModif(xrow) {
    document.getElementById("opinput").value = xrow.rowIndex;
    document.getElementById("modif").submit();
}

