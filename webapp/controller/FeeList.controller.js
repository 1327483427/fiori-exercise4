sap.ui.define([
    "com/shunyu/lqp/fiori-test-fee/controller/BaseController",
    'sap/ui/model/odata/v2/ODataModel',
    'sap/ui/core/util/MockServer',
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment"
], function (BaseController, ODataModel, MockServer, JSONModel, Filter, FilterOperator, Fragment) {
    "use strict";

    return BaseController.extend("com.shunyu.lqp.fiori-test-fee.controller.FeeList", {
        onInit: function () {
            var oModel, oView, smartfilterbar;
            var oSearchModel = new JSONModel({
                plateNumberKeys: [],
                feeStartDateFrom: null,
                feeStartDateTo: null,
                feeEndDateFrom: null,
                feeEndDateTo: null,
                changedOnFrom: null,
                changedOnTo: null,
                CreatedByKeys: []
            });
            oSearchModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
            this.setModel(oSearchModel, "searchModel");
            this.getView().byId("FeeTable").bindElement({
                path: "/Fee",
                model: "DrivingSafety",
                parameters: {
                    expand: "Vehicle"
                },
                events: {
                    dataReceived: function (response) {
                        // if (response.mParameters.data.Message !== '') {
                        //     sap.m.MessageToast.show(that.getI18NText("OPERATION_FAILED"));
                        // }
                    }
                }
            });
        },

        onSearch: function (oEvent) {
            var oSearchModel = this.getModel("searchModel"),
                oSearch = oSearchModel.getProperty("/"),
                aPlateNumberFilters = [],
                aFeeStartDateFilters = [],
                aFeeEndDateFilters = [],
                aChangedOnFilters = [],
                aCreatedByFilters = [],
                aFilterGroups = [];
            if (oSearch.plateNumberKeys && oSearch.plateNumberKeys.length > 0) {
                oSearch.plateNumberKeys.forEach(plateNumberKey => {
                    aPlateNumberFilters.push(new sap.ui.model.Filter(
                        "PLATE_NUMBER",
                        sap.ui.model.FilterOperator.EQ,
                        plateNumberKey
                    ))
                });
                aFilterGroups.push(new sap.ui.model.Filter(aPlateNumberFilters, false));
            };

            if (oSearch.feeStartDateFrom && oSearch.feeStartDateTo) {
                aFeeStartDateFilters.push(new sap.ui.model.Filter(
                    "FEE_START_DATE",
                    sap.ui.model.FilterOperator.GE,
                    oSearch.feeStartDateFrom
                ));
                aFeeStartDateFilters.push(new sap.ui.model.Filter(
                    "FEE_START_DATE",
                    sap.ui.model.FilterOperator.LT,
                    oSearch.feeStartDateTo
                ));

                aFilterGroups.push(new sap.ui.model.Filter(aFeeStartDateFilters, true));
            };

            if (oSearch.feeEndDateFrom && oSearch.feeEndDateTo) {
                aFeeEndDateFilters.push(new sap.ui.model.Filter(
                    "FEE_END_DATE",
                    sap.ui.model.FilterOperator.GE,
                    oSearch.feeEndDateFrom
                ));
                aFeeEndDateFilters.push(new sap.ui.model.Filter(
                    "FEE_END_DATE",
                    sap.ui.model.FilterOperator.LT,
                    oSearch.feeEndDateTo
                ));

                aFilterGroups.push(new sap.ui.model.Filter(aFeeEndDateFilters, true));
            };


            if (oSearch.changedOnFrom && oSearch.changedOnTo) {
                aChangedOnFilters.push(new sap.ui.model.Filter(
                    "CHANGED_ON",
                    sap.ui.model.FilterOperator.GE,
                    oSearch.changedOnFrom
                ));
                aChangedOnFilters.push(new sap.ui.model.Filter(
                    "CHANGED_ON",
                    sap.ui.model.FilterOperator.LT,
                    oSearch.changedOnTo
                ));

                aFilterGroups.push(new sap.ui.model.Filter(aChangedOnFilters, true));
            };

            if (oSearch.CreatedByKeys && oSearch.CreatedByKeys.length > 0) {
                oSearch.CreatedByKeys.forEach(createdByKey => {
                    aCreatedByFilters.push(new sap.ui.model.Filter(
                        "CREATED_BY",
                        sap.ui.model.FilterOperator.EQ,
                        createdByKey
                    ));
                });
                aFilterGroups.push(new sap.ui.model.Filter(aCreatedByFilters, true));
            };

            var oBindingItems = this.getView().byId("FeeTable").getBinding("items");
            if (aFilterGroups && aFilterGroups.length > 0) {
                var oGroupFilter = new Filter(aFilterGroups, true);
                oBindingItems.filter(oGroupFilter);
            } else {
                oBindingItems.filter([]);
            };

        },

        onClear: function (oEvent) {
            var oSearch = {
                plateNumberKeys: [],
                feeStartDateFrom: null,
                feeStartDateTo: null,
                feeEndDateFrom: null,
                feeEndDateTo: null,
                changedOnFrom: null,
                changedOnTo: null
            };
            this.getModel("searchModel").setData(oSearch);
        },

        onChangeDateRange: function (oEvent) {
            var bValid = oEvent.getParameter("valid"),
                oEventSource = oEvent.getSource();
            if (bValid) {
                oEventSource.setValueState(sap.ui.core.ValueState.None);
            } else {
                oEventSource.setValueState(sap.ui.core.ValueState.Error);
            }
        },
        onFeeSortButtonPressed: function (oEvent) {
            var _oFeeSortSettingsDialog = sap.ui.xmlfragment("com.shunyu.lqp.fiori-test-fee.view.fragment.FeeSortDialog", this);
            this._oFeeSortSettingsDialog = _oFeeSortSettingsDialog;
            this.getView().addDependent(this._oFeeSortSettingsDialog);
            this._oFeeSortSettingsDialog.open();
        },
        handleFeeSortDialogConfirm: function (oEvent) {
            var oTable = this.byId("FeeTable"),
                mParams = oEvent.getParameters(),
                oBinding = oTable.getBinding("items"),
                sPath,
                bDescending,
                aSorters = [];
            sPath = mParams.sortItem.getKey();
            bDescending = mParams.sortDescending;
            aSorters.push(new sap.ui.model.Sorter(sPath, bDescending));
            oBinding.sort(aSorters);
        },
        onDisplayNotFound: function () {
            //display the "notFound" target without changing the hash
            this.getRouter().getTargets().display("notFound", {
                fromTarget: "fee-list"
            });
        },
        onListItemPress: function (oEvent) {
            var oItem, oCtx;
            oItem = oEvent.getSource();
            oCtx = oItem.getBindingContext("DrivingSafety");
            console.log(oCtx.getProperty("UID"));
            this.getRouter().navTo("feeDetail", {
                UID: oCtx.getProperty("UID")
            });
        },
        onAddItem: function (event) {
            console.log("1111");
            if (!this._oAddFeeDialog) {
				this._oAddFeeDialog = sap.ui.xmlfragment("com.shunyu.lqp.fiori-test-fee.view.fragment.AddFee", this);
				this.getView().addDependent(this._oAddFeeDialog);
			}
			this._oAddFeeDialog.open();


        },

        onSave: function () {
			var uid = sap.ui.getCore().byId("fee_uid").getValue();
			var platenumber = sap.ui.getCore().byId("fee_palce").getValue();
			var fee = sap.ui.getCore().byId("fee_fee").getValue();
			var selectkey = sap.ui.getCore().byId("fee_cny").getProperty("selectedKey");
			var oData = {
				"UID": uid,
				"REF_VEHICLE.UID": 10000010,
				"PLATE_NUMBER": platenumber,
				"CREATED_ON": "/Date(1590658840000)/",
				"CREATED_BY": "liqp",
				"CHANGED_ON": "/Date(1622194840000)/",
				"CHANGED_BY": "liqp",
				"FEE_START_DATE": "/Date(1590658840000)/",
				"FEE_END_DATE": "/Date(1622194840000)/",
				"FEE": fee,
				"CURRENCY_CODE": selectkey
			}
			var that = this;
			this.getModel("DrivingSafety").create("/Fee", oData, {
				success: function (oData, response) {
                    alert("添加成功");
                    that.onCloseDialog();
				},
				error: function (oError) {
                    alert("添加失败");
				}
			});
			var oBinding = this.byId("feeTable").getBinding("items");
			oBinding.refresh();
			
		},

        onCloseDialog: function () {
            this._oAddFeeDialog.destroy();
			delete this._oAddFeeDialog;
        }

    });

});