/*
 *  Description: 
 *  Author: Colm Britton
 */

;(function ( $, window, undefined ) {

	// utility functions and tasks
	var getCSRFToken = function() {
		// XXX: should not use RegEx - cf.
		// http://www.quirksmode.org/js/cookies.html
		// https://github.com/TiddlySpace/tiddlyspace/commit/5f4adbe009ed4bda3ce39058a3fb07de1420358d
		var regex = /^(?:.*; )?csrf_token=([^(;|$)]*)(?:;|$)/;
		var match = regex.exec(document.cookie);
		var csrf_token = null;
		if (match && (match.length === 2)) {
			csrf_token = match[1];
		}

		return csrf_token;
	};

	var isValidSpaceName = function(name) {
		return name.match(/^[a-z][0-9a-z\-]*[0-9a-z]$/) ? true : false;
	};

	$.ajaxSetup({
		beforeSend: function(xhr) {
			xhr.setRequestHeader("X-ControlView", "false");
		}
	});

	// Create the defaults once
	var pluginName = 'getyourowntspa',
		document = window.document,
		defaults = {
			homespace: true,
			htmlPageName: "index"
		};

	// The actual plugin constructor
	function Plugin( element, options ) {
		this.element = element;

		this.options = $.extend( {}, defaults, options) ;

		this._defaults = defaults;
		this._name = pluginName;
		this.spa_space = tiddlyweb.status.space.name;

		this.init();
	}

	Plugin.prototype.init = function () {

		// probably want to do a check to see if tiddlyweb is available

		var self = this,
			$el = $(this.element),
			addInclude = (function(that) {
							return function(e) {
								that.include();
							};
						}(this));

		this.username = tiddlyweb.status.username;
		console.log(tiddlyweb.status);

		// logged in?
		if(this.username === "GUEST") {
			// are they a member
			// do they want to login and get an instance of X
			
			// hide element
			$el.hide();
		} else {
			// do they want an instance (should check if they have a space with X already included)
			var userHomespace = new tiddlyweb.Space(this.username, "/");
			userHomespace.includes().get(function(incls) {
				if (self.checkExists(incls)) {
					// provide link to their instance
					var href = self.makeLinkToInstance();
					// tell user they have already included it
					console.log("space already included, go here: ", href);
				} else {
					//show element, add click handler
					$el.click(addInclude);
				}
			}, function(xhr, error, exc, self) {
				console.log("error retrieving list of includes");
			});
		}

	};

	Plugin.prototype.checkExists = function(incls) {
		console.log(incls);
		return ( incls.indexOf(this.spa_space) !== -1 ) ? true : false;
	};

	Plugin.prototype.include = function() {
		var callback = function(data, status, xhr) {
			console.log("included!");
			console.log(data);
		};
		var errback = function(xhr, error, exc) {
			console.log("something failed");
		};
		
		// initially only allow inclusion into homespace
		if( this.options.homespace ) {
			new tiddlyweb.Space(this.username, "/")
						.includes()
						.add(this.spa_space, callback, errback);
		}
	};

	Plugin.prototype.makeLinkToInstance = function() {
		var twServer = tiddlyweb.status.server_host;
		return twServer.scheme + "://" + this.spa_space + "." + 
					twServer.host + "/" + this.options.htmlPageName;
	};

	// A really lightweight plugin wrapper around the constructor,
	// preventing against multiple instantiations
	$.fn[pluginName] = function ( options ) {
		return this.each(function () {
			if (!$.data(this, 'plugin_' + pluginName)) {
				$.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
			}
		});
	};

}(jQuery, window));
