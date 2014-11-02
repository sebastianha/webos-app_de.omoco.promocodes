function MainAssistant() {
}

MainAssistant.prototype.setup = function() {
	HOMECOUNTRY = "All Countries";

	var cookie = new Mojo.Model.Cookie("PCPrefs");
	var prefs = cookie.get();
	if (prefs != null) {
		HOMECOUNTRY = prefs.homecountry;
	}
	
	if(HOMECOUNTRY == null || HOMECOUNTRY == "")
		HOMECOUNTRY = "All Countries";
	
	this.controller.setupWidget(Mojo.Menu.appMenu,
		this.attributes = {
			omitDefaultItems: false
		},
		this.model = {
			visible: true,
			items: [
				{
					label: "Submit Code",
					command: "submit",
					shortcut: "n",
					disabled: false
				},
				{
					label: "Refresh",
					command: "refresh",
					shortcut: "r",
					disabled: false
				}
			]
		}
	);
	
	this.commandMenuAttributes = {
		menuClass: 'no-fade'
	};
	this.commandMenuModel = {
		items: [
			{
				label: 'Submit Code',
				command: 'submit',
				disabled: false
			},
			{
				icon:'refresh',
				command: 'refresh',
				disabled: false
			}
		]
	};
	this.controller.setupWidget(
		Mojo.Menu.commandMenu, 
		this.commandMenuAttributes,
		this.commandMenuModel
	);	
	
	this.spinnerTopLAttrs = {spinnerSize: 'small'};
	this.spinnerTopModel = {spinning: true};
	this.controller.setupWidget('waiting_spinner_top', this.spinnerTopLAttrs, this.spinnerTopModel);

	this.controller.setupWidget("countryselector",
		this.attributes = {
			label: "Filter", 
			choices: [
				{ label: "All Countries", value:"All Countries" },
				{ label: "Unknown", value:"Unknown" },
				{ label: "United States", value:"United States" },
				{ label: "Canada", value:"Canada" },
				{ label: "France", value:"France" },
				{ label: "Germany", value:"Germany" },
				{ label: "Ireland", value:"Ireland" },
				{ label: "Mexico", value:"Mexico" },
				{ label: "Spain", value:"Spain" },
				{ label: "United Kingdom", value:"United Kingdom" }
			]
		},
		this.model = { value: HOMECOUNTRY, disabled: false }
	);

	Mojo.Event.listen($("countryselector"), Mojo.Event.propertyChange, this.countryselectorChanged.bind(this));
	
	this.promoCodesList = [];
	
	codesListModel = {
		listTitle: 'Codes',
		items : this.promoCodesList
	};
	
	this.controller.setupWidget("codeslist",
		this.attributes = {
			itemTemplate:  'main/listitem',
			listTemplate:  'main/listcontainer',
			emptyTemplate: 'main/emptylist',
			swipeToDelete: false,
			reorderable: false,
			addItemLabel:  'Submit Promo Code...',
			renderLimit: 50
		},
		this.model = codesListModel
	);
	
	this.controller.listen("codeslist", Mojo.Event.listAdd, this.itemAdd.bindAsEventListener(this));
	this.controller.listen("codeslist", Mojo.Event.listTap, this.itemTap.bindAsEventListener(this));
	
	this.reloadList(false);
};

MainAssistant.prototype.reloadList = function(silent) {
	if(!silent) {
		codesListModel.items = [];
		this.controller.modelChanged(codesListModel);
	}
	
	this.spinnerTopModel.spinning = true;
	this.controller.modelChanged(this.spinnerTopModel);
			
	var url = "http://pcs.omoco.de/pcs/get.php";
	var request = new Ajax.Request(url, {
		method: 'get',
		evalJSON: 'force',
		onSuccess: this.requestSuccess.bind(this),
		onFailure: this.requestFailure.bind(this)
	});
}

MainAssistant.prototype.requestSuccess = function(response) {
	this.spinnerTopModel.spinning = false;
	this.controller.modelChanged(this.spinnerTopModel);
	
	//Mojo.Log.info(Object.toJSON(response.responseJSON));
	
	this.promoCodesList = response.responseJSON;
	/*codesListModel.items = this.promoCodesList;
	this.controller.modelChanged(codesListModel);*/
	this.listHasChanged();
};

MainAssistant.prototype.itemTap = function(event) {
	//Mojo.Log.info(event.item.code);

	this.controller.showDialog({
		template: 'main/dialog-scene',
		assistant: new MainDialogAssistant(this, event.item),
		preventCancel: false
	});
}

MainAssistant.prototype.itemAdd = function(event) {
	Mojo.Controller.stageController.pushScene("submit");
}

MainAssistant.prototype.countryselectorChanged = function(event) {
	HOMECOUNTRY = event.value;
	
	var cookie = new Mojo.Model.Cookie("PCPrefs");
	cookie.put({
		homecountry: HOMECOUNTRY
	});
	
	this.listHasChanged();
}

MainAssistant.prototype.listHasChanged = function() {
	if(HOMECOUNTRY == "All Countries") {
		codesListModel.items = this.promoCodesList; 
	} else {
		var tmpList = [];
		for(var i = 0; i < this.promoCodesList.length; i++) {
			if(this.promoCodesList[i].country == HOMECOUNTRY) {
				tmpList.push(this.promoCodesList[i]);
			}
		}
		codesListModel.items = tmpList;
	}
	
	this.controller.modelChanged(codesListModel);
};

MainAssistant.prototype.requestFailure = function(response) {
};

MainAssistant.prototype.activate = function(event) {
};

MainAssistant.prototype.deactivate = function(event) {
};

MainAssistant.prototype.cleanup = function(event) {
};

MainAssistant.prototype.handleCommand = function(event) {
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
		  
	if (event.type == Mojo.Event.command) {
		switch (event.command) {
			case 'submit':
				Mojo.Controller.stageController.pushScene("submit");
				break;
			case 'refresh':
				this.reloadList(false);
				break;
		}
	}
}