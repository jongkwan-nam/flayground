/**
 * Rest Service
 */
var restCall = function(url, args, callback) {
	var DEFAULTS = {
			method: "GET",
			data: {},
			mimeType: "application/json",
			contentType: "application/json",
			async: true,
			cache: false,
			title: ""
	};	
	var settings = $.extend({}, DEFAULTS, args);
	if (settings.method != 'GET' && typeof settings.data === 'object') {
		settings.data = JSON.stringify(settings.data);
	}
	console.log('restCall', settings.method, url, settings.data);

	settings.title != "" && loading.on(settings.title);
	
	$.ajax(PATH + url, settings).done(function(data) {
		if (callback)
			callback(data);
		settings.title != "" && loading.off();
	}).fail(function(jqXHR, textStatus, errorThrown) {
		console.log("restCall fail", url, '\n jqXHR=', jqXHR, '\n textStatus=', textStatus, '\n errorThrown=', errorThrown);
		var errMsg = "";
		if (jqXHR.getResponseHeader('error')) {
			errMsg = 'Message: ' + jqXHR.getResponseHeader('error.message') + "<br>" 
				   + 'Cause: '   + jqXHR.getResponseHeader('error.cause');
		} else if (jqXHR.responseJSON) {
			errMsg = 'Error: '     + jqXHR.responseJSON.error + '<br>'  
				   + 'Message: '   + jqXHR.responseJSON.message + '<br>'
				   + 'Status: '    + jqXHR.responseJSON.status + '<br>'
				   + 'Path: '      + jqXHR.responseJSON.path;
		} else {
			errMsg = 'Error:<br>' + textStatus + "<br>" + errorThrown;
		}
		var $errorBody = $("<div>", {'class': 'overlay-error-body'}).append(errMsg);
		loading.on($errorBody);
	}).always(function(data_jqXHR, textStatus, jqXHR_errorThrown) {
	});
};

var Rest = {
		Flay: {
			get: function(opus, callback) {
				restCall('/flay/' + opus, {}, callback);
			},
			list: function(callback) {
				restCall('/flay/list', {}, callback);
			},
			search: function(search, callback) {
				restCall('/flay/find', {data: search}, callback);
			},
			find: function(query, callback) {
				restCall('/flay/find/' + query, {}, callback);
			},
			findByTag: function(tag, callback) {
				restCall("/flay/find/tag/" + tag.id , {}, callback);
			},
			findByActress: function(actress, callback) {
				restCall("/flay/find/actress/" + actress.name , {}, callback);
			},
			findCandidates: function(callback) {
				restCall("/flay/candidates", {}, callback);
			},
			acceptCandidates: function(flay, callback) {
				restCall('/flay/candidates/' + flay.opus, {method: "PATCH"}, callback);
			},
			play: function(flay) {
				restCall('/flay/play/' + flay.opus, {method: "PATCH"});
			},
			subtitles: function(flay) {
				restCall('/flay/edit/' + flay.opus, {method: "PATCH"});
			},
			rename: function(opus, flay, callback) {
				restCall('/flay/rename/' + opus, {data: flay, method: "PUT"}, callback);
			},
			openFolder: function(folder) {
				restCall('/flay/open/folder', {method: "PUT", data: folder});
			},
			deleteFile: function(file, callback) {
				restCall('/flay/delete/file', {method: "PUT", data: file}, callback);
			}
		},
		History: {
			list: function(callback) {
				restCall('/info/history/list', {}, callback);
			},
			find: function(query, callback) {
				restCall('/info/history/find/' + query, {}, callback);
			},
			findAction: function(action, callback) {
				restCall('/info/history/find/action/' + action, {}, callback);
			}
		},
		Video: {
			update: function(video, callback) {
				restCall('/info/video', {data: video, method: "PATCH"}, callback);
			}
		},
		Studio: {
			findOneByOpus: function(opus, callback) {
				restCall('/info/studio/findOneByOpus/' + opus, {}, callback);
			}
		},
		Actress: {
			get: function(name, callback) {
				if (name != "") {
					restCall('/info/actress/' + name, {}, callback);
				} else {
					console.log("Rest.Actress.get: no name!");
				}
			},
			list: function(callback) {
				restCall('/info/actress/list', {}, callback);
			},
			update: function(actress, callback) {
				restCall('/info/actress', {data: actress, method: "PATCH"}, callback);
			},
			persist: function(actress, callback) {
				restCall('/info/actress', {data: actress, method: "PUT"}, callback);
			},
			rename: function(originalName, actress, callback) {
				restCall('/info/actress/' + originalName, {data: actress, method: "PUT"}, callback);
			},
			findByLocalname: function(name, callback) {
				restCall('/info/actress/find/byLocalname/' + name, {}, callback);
			},
			nameCheck(limit, callback) {
				restCall('/info/actress/func/nameCheck/' + limit, {title: 'Name checking...'}, callback);
			}
		},
		Tag: {
			get: function(tagId, callback) {
				restCall('/info/tag/' + tagId, {}, callback);
			},
			list: function(callback) {
				restCall('/info/tag/list', {}, callback);
			},
			create:	function(tag, callback) {
				restCall('/info/tag', {data: tag, method: "POST"}, callback);
			},
			update: function(tag, callback) {
				restCall('/info/tag', {data: tag, method: "PATCH"}, callback);
			},
			delete: function(tag, callback) {
				restCall('/info/tag', {data: tag, method: "DELETE"}, callback);
			}
		},
		Image: {
			size: function(callback) {
				restCall('/image/size', {}, callback);
			},
			list: function(callback) {
				restCall('/image/list', {}, callback);
			},
			download: function(data, callback) {
				restCall('/image/pageImageDownload', {data: data, title: 'Download images'}, callback);
			},
			get: function(idx, callback) {
				restCall('/image/' + idx, {}, callback);
			},
			'delete': function(idx, callback) {
				restCall('/image/' + idx, {method: 'DELETE'}, callback);
			}
		},
		Html: {
			get: function(url, callback) {
				restCall(url, {contentType: "text/html", mimeType: "text/html"}, callback); 
			}
		},
		Batch: {
			start: function(type, title, callback) {
				restCall('/batch/start/' + type, {method: "PUT", title: title}, callback);
			},
			setOption: function(type, callback) {
				restCall('/batch/option/' + type, {method: "PUT"}, callback);
			},
			getOption: function(type, callback) {
				restCall('/batch/option/' + type, {}, callback);
			},
			reload: function(callback) {
				restCall("/batch/reload", {method: "PUT", title: "Source reload"}, callback);
			}
		},
		Security: {
			whoami: function(callback) {
				restCall("/whoami", {async: false}, callback);
			}
		}
};
