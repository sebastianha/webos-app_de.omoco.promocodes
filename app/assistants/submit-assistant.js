function SubmitAssistant() {
}

SubmitAssistant.prototype.setup = function() {
	this.submitting = false;
	
	var promocodeattr = {
		hintText: 'Enter Promo Code',
		textFieldName: 'name', 
		modelProperty: 'original', 
		multiline: false,
		focus: false, 
		textCase: Mojo.Widget.steModeLowerCase,
		autoReplace: false,
		maxLength: 40
	};
	promocodemodel = {
		'original' : "",
		disabled: false
	};
	this.controller.setupWidget('promocode', promocodeattr, promocodemodel);

	this.countrychoice = [];
	countrySelectorsModel = { country: "Unknown" };

	//this.controller.listen('countryselector', Mojo.Event.propertyChange, this.countrySelectorChanged.bindAsEventListener(this));
	this.controller.setupWidget('countryselector', {label: $L("Country"), choices: this.countrychoice, modelProperty:'country'}, countrySelectorsModel);

	countrySelectorsModel.choices = [
		{ label: "Unknown", value:"Unknown" },
		{ label: "United States", value:"United States" },
		{ label: "Canada", value:"Canada" },
		{ label: "France", value:"France" },
		{ label: "Germany", value:"Germany" },
		{ label: "Ireland", value:"Ireland" },
		{ label: "Mexico", value:"Mexico" },
		{ label: "Spain", value:"Spain" },
		{ label: "United Kingdom", value:"United Kingdom" }
	];
	this.controller.modelChanged(countrySelectorsModel);

	
	this.cancel = this.cancel.bindAsEventListener(this);
	this.controller.listen("cancel", Mojo.Event.tap, this.cancel.bind(this));
	
	this.submit = this.submit.bindAsEventListener(this);
	this.controller.listen("submit", Mojo.Event.tap, this.submit.bind(this));
	
	this.controller.setupWidget('submit', 
    	this.atts = {
			type: Mojo.Widget.activityButton
		}, 
		this.model = {
			buttonLabel: 'Submit Promo Code',
			buttonClass: 'affirmative',
			disabled: false
		}
	);
};

SubmitAssistant.prototype.submit = function(event) {
	if(!this.submitting) {
		this.submitting = true;
		
		var promocode = promocodemodel['original'];
		var country = countrySelectorsModel.country;
		
		var url = "http://pcs.omoco.de/pcs/put.php?c=" + promocode + "&cc=" + country;
		var request = new Ajax.Request(url, {
			method: 'get',
			evalJSON: 'force',
			onSuccess: this.requestSuccess.bind(this),
			onFailure: this.requestFailure.bind(this)
		});
		//Mojo.Controller.stageController.popScene();
	}
};

SubmitAssistant.prototype.requestSuccess = function(response) {
	Mojo.Log.info("Response: " + response.responseText);
	
	if (response.responseText == "0") {
		this.controller.showAlertDialog({
			onChoose: function(value) {
				Mojo.Controller.stageController.popScene();
			},
			title: "Submission Successful",
			message: "Promo Code successfully submitted. Thank you very much!",
			choices:[ {label:'OK', value:'OK', type:'color'} ]
		});
	} else if (response.responseText == "1" || response.responseText == "2") {
		Mojo.Controller.errorDialog("This Promo Code has already been submitted by an other user but thanks anyway. (Err: " + response.responseText + ")");
	} else if (response.responseText == "-5") {
		Mojo.Controller.errorDialog("Promo Code valid but not active at the moment. When the Promo has not startet yet you can try again when it is active. (Err: " + response.responseText + ")");
	} else {
		Mojo.Controller.errorDialog("Promo Code not valid. Please check if you entered the code correctly. (Err: " + response.responseText + ")");
	}
	
	this.controller.get('submit').mojo.deactivate();
	this.submitting = false;
};

SubmitAssistant.prototype.requestFailure = function(response) {
	this.controller.get('submit').mojo.deactivate();
	Mojo.Controller.errorDialog("Error submitting Promo Code.");
};

SubmitAssistant.prototype.cancel = function(event) {
	Mojo.Controller.stageController.popScene();
};

SubmitAssistant.prototype.activate = function(event) {
};

SubmitAssistant.prototype.deactivate = function(event) {
};

SubmitAssistant.prototype.cleanup = function(event) {
};

SubmitAssistant.prototype.handleCommand = function(event) {
	if(event.type == Mojo.Event.commandEnable && (event.command == Mojo.Menu.helpCmd)) {
		event.stopPropagation();
	}

	if (event.type == Mojo.Event.command) {
		switch (event.command) {
			case Mojo.Menu.helpCmd:
				Mojo.Controller.stageController.pushAppSupportInfoScene();
				break;
		}
	}
}