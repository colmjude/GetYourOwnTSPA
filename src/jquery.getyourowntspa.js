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
			homespace: true
		};

	// The actual plugin constructor
	function Plugin( element, options ) {
		this.element = element;

		this.options = $.extend( {}, defaults, options) ;

		this._defaults = defaults;
		this._name = pluginName;

		this.init();
	}

	Plugin.prototype.init = function () {

		// probably want to do a check to see if tiddlyweb is available

		var $el = $(this.element),
			addInclude = (function(that) {
							return function(e) {
								that.include();
							};
						}(this));

		this.username = tiddlyweb.status.username;

		if(this.username === "GUEST") {
			// are they a member
			// do they want to login and get an instance of X
			
			// hide element
			$el.hide();
		} else {
			// currently logged in
			// do they want an instance (should check if they have a space with X already included)
			
			//show element, add click handler
			$el.click(addInclude)
		}

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
						.add(tiddlyweb.status.space.name, callback, errback);
		}
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
