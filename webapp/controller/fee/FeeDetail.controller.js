sap.ui.define([
	"com/shunyu/lqp/fiori-test-fee/controller/BaseController"
], function (BaseController) {
	"use strict";
	return BaseController.extend("com.shunyu.lqp.fiori-test-fee.controller.fee.FeeDetail", {
		onInit: function () {
			var oRouter = this.getRouter();
			oRouter.getRoute("feeDetail").attachMatched(this._onRouteMatched, this);
		},
		_onRouteMatched: function (oEvent) {
			var oArgs, oView;
			oArgs = oEvent.getParameter("arguments");
			oView = this.getView();
			oView.bindElement({
				path: "/Fee('" + oArgs.UID + "')",
				model: "DrivingSafety",
				events: {
					// change: this._onBindingChange.bind(this),
					dataRequested: function (oEvent) {
						oView.setBusy(true);
					},
					dataReceived: function (oEvent) {
						oView.setBusy(false);
					}
				}
			});

		},

		onPress: function (oEvent) {
			var name = event.getSource().data("name");
			if (this.fragments[name]) {
				this.fragments[name].close();
			}
		}
	});
});