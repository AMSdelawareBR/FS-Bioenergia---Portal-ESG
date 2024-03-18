sap.ui.define([
	"br/agr/fs/esgsurvey/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/m/GroupHeaderListItem",
	"sap/ui/core/routing/History",
	"sap/ui/Device",
	"sap/m/MessageBox",
	"br/agr/fs/esgsurvey/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"	
], function(BaseController, UIComponent, JSONModel, GroupHeaderListItem, History, Device, MessageBox, formatter, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("br.agr.fs.esgsurvey.controller.Question", {

		formatter: formatter,
		/**
		 * Controller Initialization
		 * @private
		 */
		onInit: function() {
			this.getRouter().getRoute("question").attachPatternMatched(this._onDetailMatched, this);
		},

		/**
		 * Route Matched
		 * @param {Event} oEvent Event Data
		 * @private
		 */
		_onDetailMatched: function(oEvent) {
			this.getView().byId("questionSearch").setValue("")
		},

		/**
		 * Filter Questions
		 * @param {Event} oEvent Event Data
		 * @public
		 */		
		onFilterQuestions: function(oEvent){
			let sQuery = oEvent.getSource().getValue()
			let aFilter = [];
			if (sQuery && sQuery.length > 0){
				aFilter.push(new Filter("Enunciado", FilterOperator.Contains, sQuery));
			}

			this.getView().byId("idQuestionTable").getBinding("items").filter(aFilter)			
		},

		/**
		 * Question Press Event
		 * @param {Event} oEvent Event Data
		 * @private
		 */	
		onQuestionPress: function(oEvent){
			let item = oEvent.getSource()
			let bindingContext = item.getBindingContext()
			let question = bindingContext.getObject().Pergunta
			this.getRouter().navTo("questionItem", {
				questionId: question
			});						
		},

		/**
		 * Question Creation Event
		 * @param {Event} oEvent Event Data
		 * @private
		 */		
		onQuestionCreate: function(oEvent){
			this.getRouter().navTo("questionItem", {
				questionId: "NEW"
			});						
		}
	});
});