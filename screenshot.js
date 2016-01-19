var page = require('webpage').create(),
    system = require('system'),
    address, output, size, delay, timeout;

if (system.args.length < 3 || system.args.length > 5) {
	console.log('Usage: rasterize.js URL filename size');
	phantom.exit(1);
} else {
	delay = 1000;	// delay after page loads before capturing
	timeout = 10000;	// timeout for script ending and rendering whatever we have
	address = system.args[1];	// url to render
	output = system.args[2];	// filename to render to
	size = system.args[3] || 'desktop';	// desktop or mobile view
	
	if (size == 'desktop'){
		page.viewportSize = { width: 1280, height: 1024 };
		page.settings.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9';
	} else if (size == 'mobile'){
		page.viewportSize = { width: 320, height: 480 };
		page.settings.userAgent = 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 6_0 like Mac OS X; en-us) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A523 Safari/8356.25';
	}
	
	page.onResourceRequested = function(requestData, request) {
		//console.log('Requesting: '+requestData['url']);
		
		if ((/(.google-analytics.com|stats.g.doubleclick.net)/gi).test(requestData['url'])) {
			console.log('Block Google Analytics: ' + requestData['url']);
			request.abort();
		}
	};
	page.onResourceError = function(resourceError) {
	    page.reason = resourceError.errorString;
	    page.reason_url = resourceError.url;
	};
	
	// if i take longer than X seconds - render and exit
	setTimeout(function(){
		console.log('Timeout');
		renderAndFinish();
	}, timeout);
	
	console.log('Requesting url: '+address);
	page.open(address, function (status) {
		console.log('Status: '+status);
		
		if (status !== 'success') {
			console.log( "Error opening url \"" + page.reason_url + "\": " + page.reason);
			phantom.exit(1);
		} else {
			window.setTimeout(renderAndFinish, delay);
		}
	});
}

function renderAndFinish(){
	
	console.log('Evaluating...');
	page.evaluate(function() {
		//document.body.bgColor = 'white';
	});
	
	console.log('Clipping...');
	page.clipRect = { top: 0, left: 0, width: page.viewportSize.width, height: page.viewportSize.height };
	
	console.log('Rendering...');
	page.render(output);
	
	console.log('Exit');
	phantom.exit();
	
}
