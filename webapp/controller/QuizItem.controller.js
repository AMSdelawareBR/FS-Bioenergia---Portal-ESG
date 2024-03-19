sap.ui.define([
	"br/agr/fs/esgsurvey/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/m/GroupHeaderListItem",
	"sap/ui/core/routing/History",
	"sap/ui/Device",
	"sap/m/MessageBox",
	"br/agr/fs/esgsurvey/util/Entity",	
	'sap/m/Token',
	"sap/m/MessageToast",
	"br/agr/fs/esgsurvey/model/formatter",
	"sap/ui/core/syncStyleClass",
	"sap/ui/core/Fragment"
], function(BaseController, UIComponent, JSONModel, GroupHeaderListItem, History, Device, MessageBox, Entity, Token, MessageToast, formatter, syncStyleClass, Fragment) {
	"use strict";

	return BaseController.extend("br.agr.fs.esgsurvey.controller.QuizItem", {
		formatter: formatter,
		/**
		 * Controller Initialization
		 * @private
		 */
		onInit: function() {
			this._formFragments = {};
			this.getRouter().getRoute("quizItem").attachPatternMatched(this._onDetailMatched, this);
		},

		/**
		 * Route Matched
		 * @param {Event} oEvent Event Data
		 * @private
		 */
		_onDetailMatched: function(oEvent) {
			this._initializeQuizItemData({}, true);
			let sQuizId = oEvent.getParameter("arguments").quizId;
			let sQuizVersion = oEvent.getParameter("arguments").quizVersion;

			this.getModel("quizView").setData({
				edit: true,
				newItem: sQuizId === "NEW"
			})
			this.getModel("quizView").refresh(true)	

			if (sQuizId !== "NEW"){
				var sObjectPath = this.getModel().createKey("/ZC_GEN_QUESTIONARIO", {
					Questionario: sQuizId,
					Version: sQuizVersion
				});

				this.setAppBusy(true);
				this.getModel().read(sObjectPath, {
					urlParameters: {
						$expand: "to_Perguntas,to_Perguntas/to_Pergunta"
					},
					success: function (oQuizData) {						
						this.setAppBusy(false);
						this._initializeQuizEdit(oQuizData)
					}.bind(this),
					error: function (oError) {}
				});				
			}else{
				this._initializeQuizItemData({}, true);
				this._showFormFragment("QuizItemEdit");			
			}	
		},

		_initializeQuizEdit: function(oQuizData){			
			this._initializeQuizItemData(oQuizData, false);
			this._showFormFragment("QuizItemEdit");
		},

		/**
		 * Initialize Quiz Item
		 * @param {JSONObject} oQuiz Question Data
		 * @private
		 */
		_initializeQuizItemData: function (oQuizItem, bNewQuiz ) {
			// Base Build			
			var oQuizItemBase = {}

			// Info Parsing
			if (!bNewQuiz){				
				oQuizItemBase = Entity.buildQuiz(bNewQuiz);
				this._moveCorrespondingAttributes("ZC_GEN_QUESTIONARIOType", oQuizItem, oQuizItemBase); // Questionário				
				this._moveCorrespondingAttributes("ZC_GEN_PERGUNTASType", oQuizItem.to_Perguntas.results, oQuizItemBase._Perguntas); // Perguntas
			}else{
				oQuizItemBase = Entity.buildQuiz(bNewQuiz);
			}

			// Model
			this.getModel("quizEdit").setData(
				oQuizItemBase
			);			
			this.getModel("quizEdit").refresh(true)
		},		

		/**
		 * Handle Quiz Saving
		 * @param {JSONObject} oEvent Event Data
		 * @public
		 */
		onSaveQuizItem: function(oEvent){
			// Model 
			let quizEdit = this.getModel("quizEdit").getData()

			// OData Creation
			let quizData = {
				Questionario: quizEdit.Questionario,
				Version: quizEdit.Version,
				Descricao: quizEdit.Descricao,
				DataInicio: quizEdit.DataInicio,
				DataFim: quizEdit.DataFim,
				Status: quizEdit.Status,
				to_Perguntas: quizEdit._Perguntas.map(question => ({
					Pergunta: question.Pergunta
				}))
			}
		
			this.setAppBusy(true)
			this.getModel().create("/ZC_GEN_QUESTIONARIO", quizData, {
				success: function (oData) {
					this.setAppBusy(false);
					MessageToast.show(this.getResourceBundle().getText("quizCreateSuccess"));
					this.getRouter().navTo("quiz");					
				}.bind(this),
				error: function (oError) {				
					this.setAppBusy(false);
				}.bind(this)
			});
		},

		/**
		 * Handle Question Add
		 * @param {JSONObject} oEvent Event Data
		 * @public
		 */
		onQuestionAdd: function(oEvent){
			var oButton = oEvent.getSource(),
				oView = this.getView();

			if (!this._QuestionDialog) {
				this._QuestionDialog = Fragment.load({
					id: this.getView().getId(),
					name: "br.agr.fs.esgsurvey.view.fragments.QuestionSelection",
					controller: this
				}).then(function (oDialog){
					oDialog.setModel(this.getView().getModel());
					oDialog.setModel(this.getOwnerComponent().getModel("i18n"), "i18n");
					return oDialog;
				}.bind(this));
			}

			this._QuestionDialog.then(function(oDialog){
				this._configDialog(oButton, oDialog);
				oDialog.open();
			}.bind(this));			
		},

		_configDialog: function (oButton, oDialog) {
			// Set style classes
			var sResponsiveStyleClasses = "sapUiResponsivePadding--header sapUiResponsivePadding--subHeader sapUiResponsivePadding--content sapUiResponsivePadding--footer";
			var bResponsivePadding = !!oButton.data("responsivePadding");
			oDialog.toggleStyleClass(sResponsiveStyleClasses, bResponsivePadding);

			// clear the old search filter
			oDialog.getBinding("items").filter([]);

			// toggle compact style
			syncStyleClass("sapUiSizeCompact", this.getView(), oDialog);
		},

		/**
		 * Handle Question -> Quiz Selection
		 * @param {JSONObject} oEvent Event Data
		 * @public
		 */		
		onQuestionDialogClose: function(oEvent){
			debugger
			var aContexts = oEvent.getParameter("selectedContexts");
			let aQuestions = []
			if (aContexts && aContexts.length) {
				aQuestions = aContexts.map((context) => context.getObject() )
			} 

			let quizEdit =  this.getModel("quizEdit").getData()
			quizEdit._Perguntas = []			
			this._moveCorrespondingAttributes("ZC_GEN_PERGUNTASType", aQuestions, quizEdit._Perguntas); // Solicitation
			oEvent.getSource().getBinding("items").filter([]);		
			this.getModel("quizEdit").setData(quizEdit)
			this.getModel("quizEdit").refresh(true)			
		},

		/**
		 * Move Corresponding
		 * @param {String} sEntityName Entity Name
		 * @param {JSONObject} oBaseFrom Object Base
		 * @param {JSONObject} oBaseTo Object Destiny
		 * @private
		 */
		_moveCorrespondingAttributes: function (sEntityName, oBaseFrom, oBaseTo) {
			var oMaintenanceMetadata = this.getView().getModel().getServiceMetadata().dataServices.schema[0].entityType.find(
				function (oEntity) {
					return oEntity.name === sEntityName;
				});

			if(Array.isArray(oBaseFrom)){
				oBaseFrom.forEach(baseFrom =>{
					let baseTo = {}
					oMaintenanceMetadata.property.forEach(function (oProperty) {
						if (baseFrom.hasOwnProperty(oProperty.name) && baseFrom[oProperty.name]) {
							baseTo[oProperty.name] = baseFrom[oProperty.name];
						}
					});		
					oBaseTo.push(baseTo)			
				})
			}
			else{
				oMaintenanceMetadata.property.forEach(function (oProperty) {
					if (oBaseFrom.hasOwnProperty(oProperty.name) && oBaseFrom[oProperty.name]) {
						oBaseTo[oProperty.name] = oBaseFrom[oProperty.name];
					}
				});
			}
		},

		/**
		 * Get the Form Fragment
		 * @public
		 * @param {String} sFragmentName Fragment Name
		 * @returns {sap.ui.core.FragmentDefinition} The Fragment Definition
		 */
		_getFormFragment: function (sFragmentName) {
			var oFormFragment = this._formFragments[sFragmentName];

			if (oFormFragment) {
				return oFormFragment;
			}

			oFormFragment = sap.ui.xmlfragment(this.getView().getId(), "br.agr.fs.esgsurvey.view.fragments." + sFragmentName, this);

			this._formFragments[sFragmentName] = oFormFragment;
			return this._formFragments[sFragmentName];
		},

		/**
		 * Show the Form Fragment
		 * @public
		 * @param {String} sFragmentName Fragment Name
		 */
		_showFormFragment: function (sFragmentName) {
			var oPage = this.byId("quizItem");
			oPage.removeAllContent();
			oPage.insertContent(this._getFormFragment(sFragmentName));
		}		
	});
});