function MainDialogAssistant(sceneAssistant, item) {
	this.sceneAssistant = sceneAssistant;
	this.controller = sceneAssistant.controller;
	
	this.item = item;
}

MainDialogAssistant.prototype.setup = function(widget) {
	this.widget = widget;
	
	this.download = this.download.bindAsEventListener(this);
	this.controller.listen("download", Mojo.Event.tap, this.download.bind(this));
	this.cancel = this.cancel.bindAsEventListener(this);
	this.controller.listen("cancel", Mojo.Event.tap, this.cancel.bind(this));

	this.worked = this.worked.bindAsEventListener(this);
	this.controller.listen("worked", Mojo.Event.tap, this.worked.bind(this));
	this.workednot = this.workednot.bindAsEventListener(this);
	this.controller.listen("workednot", Mojo.Event.tap, this.workednot.bind(this));
	
	this.controller.setupWidget('download', 
    	this.atts = {
			type: Mojo.Widget.activityButton
		}, 
		this.model = {
			buttonLabel: 'Download App',
			buttonClass: 'affirmative',
			disabled: false
		}
	);
	
	this.controller.setupWidget('worked', 
    	this.atts = {
			type: Mojo.Widget.activityButton
		}, 
		this.model = {
			buttonLabel: 'Worked',
			buttonClass: 'affirmative',
			disabled: false
		}
	);
	
	this.controller.setupWidget('workednot', 
    	this.atts = {
			type: Mojo.Widget.activityButton
		}, 
		this.model = {
			buttonLabel: 'Failed',
			buttonClass: 'negative',
			disabled: false
		}
	);

	
	this.controller.get("title-name").innerHTML = this.item.name;
	this.controller.get("title-icon").innerHTML = "<img src=\"http://cdn.downloads.palm.com/public/" + this.item.icon + "\" width=48 height=48>";
}

MainDialogAssistant.prototype.download = function(event) {
	this.controller.serviceRequest("palm://com.palm.applicationManager", {
		method: "open",
		parameters: {
			id: "com.palm.app.findapps",
			params: {
				target: "http://developer.palm.com/appredirect/?promocode=" + this.item.code
			}
		}
	});
	
	var url = "http://pcs.omoco.de/pcs/down.php?c=" + this.item.code;
	var request = new Ajax.Request(url, {
		method: 'get',
		onSuccess: this.requestResponse.bind(this),
		onFailure: this.requestResponse.bind(this)
	});
	
	this.widget.mojo.close();
}

MainDialogAssistant.prototype.cancel = function(event) {
	this.widget.mojo.close();
}

MainDialogAssistant.prototype.worked = function(event) {
	var url = "http://pcs.omoco.de/pcs/rate.php?c=" + this.item.code + "&w=1";
	var request = new Ajax.Request(url, {
		method: 'get',
		onSuccess: this.requestResponse.bind(this),
		onFailure: this.requestResponse.bind(this)
	});
}

MainDialogAssistant.prototype.workednot = function(event) {
	var url = "http://pcs.omoco.de/pcs/rate.php?c=" + this.item.code + "&w=0";
	var request = new Ajax.Request(url, {
		method: 'get',
		onSuccess: this.requestResponse.bind(this),
		onFailure: this.requestResponse.bind(this)
	});
}

MainDialogAssistant.prototype.requestResponse = function(event) {
	this.widget.mojo.close();
}

MainDialogAssistant.prototype.activate = function(event) {
}

MainDialogAssistant.prototype.deactivate = function(event) {
}

MainDialogAssistant.prototype.cleanup = function(event) {
}