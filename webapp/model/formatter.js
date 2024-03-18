sap.ui.define([], () => {
	"use strict";

	return {
		pillarText(sStatus) {
			const oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			switch (sStatus) {
				case "E":
					return oResourceBundle.getText("pillarE");
				case "S":
					return oResourceBundle.getText("pillarS");
				case "G":
					return oResourceBundle.getText("pillarG");
				default:
					return sStatus;
			}
		},
		questionStatusText(sStatus) {
			const oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			switch (sStatus) {
				case "A":
					return oResourceBundle.getText("questionStatusA");
				case "L":
					return oResourceBundle.getText("questionStatusL");
				default:
					return sStatus;
			}
		}        
	};
});