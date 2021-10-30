'use strict';

const { API } = require('vercel-serverless-api');
const Handlebars = require('handlebars');

/**
 * Github User data
 * @typedef {Object} GithubUser
 * @property {string} githubUser Github user name. Default: "YOUR_USER"
 * @property {string} owner Owner of the repository. Default: "YOUR NAME"
 * @property {string} projectName Repository name. Default "REPOSITORY_NAME"
 */

/**
 * Colors for the Template
 * @typedef {Object} Colors
 * @property {string} brand Hex color for the brand. Without the #. Default 303030
 * @property {string} hover Hex color for the hover. Without the #. Default 6c2650
 * @property {string} background Hex color for the background. Without the #. Default c7c7c7
 * @property {string} disclaimer Hex color for the disclaimer. Without the #. Default 303030
 * @property {string} footerLine Hex color for the footerLine. Without the #. Default 303030
 */

/**
 * Template Messages
 * @typedef {Object} Messages
 * @property {string} banner Banner Image. Default: "https://sdtimes.com/wp-content/uploads/2020/04/1_oBm_3saYz4AI_MS6OekdFQ.png"
 * @property {string} location A place where you, your project, or your company is located. Default: "Somewhere in Earth, Solar System, Milky War, Known Universe"
 * @property {string} finalMessage A message that will be displayed at the end of the page. Default: "Thank you!"
 */

module.exports = class IndexAPI extends API {

	/**
	 * Template for the index page
	 * @returns {string} Template HTML code for use with Handlebars
	 */
	static get template() {
		// eslint-disable-next-line max-len
		return '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "https://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="https://www.w3.org/1999/xhtml" style="height:100%;"><head><title>{{projectName}} Service</title><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0 "><style>*::after{box-sizing:border-box}*:before{box-sizing:border-box}.{{projectName}}-main__footer-item:hover{color:#{{colorHover}} !important}</style></head><body class="{{projectName}}-main__body" style="box-sizing:border-box;font-family:sans-serif;text-align:center;background-color:#{{colorBackground}};height:100%;min-width:fit-content;margin:0;"><table class="{{projectName}}-main__container" style="box-sizing:border-box;border-spacing:0;margin:auto;height:675px;max-width:640px;width:90%;padding:0 10px;"><thead style="box-sizing:border-box;"><th class="{{projectName}}-main__header" style="box-sizing:border-box;padding:0px;margin:0;padding:86px 0 56px 0;"><a href="https://github.com/{{githubUser}}/{{projectName}}" alt="{{projectName}} Service Link" target="_blank"><img src="{{banner}}" alt="logo-{{projectName}}" style="box-sizing:border-box;width:100%;"></a></th></thead><tfoot style="box-sizing:border-box;"><tr style="box-sizing:border-box;"><td class="{{projectName}}-main__footer" style="box-sizing:border-box;padding:0px;margin:0;padding:43px 0 28px 0;"><a href="https://github.com/{{githubUser}}" class="{{projectName}}-main__footer-item" style="box-sizing:border-box;font-size:18px;color:#{{colorBrand}};font-weight:500;margin-bottom:20px;display:inline-block;text-decoration:none;">{{owner}} Github</a><p class="{{projectName}}-main__footer-text" style="box-sizing:border-box;color:#{{colorDisclaimer}};font-size:8px;line-height:13px;font-weight:400;margin:0;">Copyright &copy; {{year}} {{owner}}</p><p class="{{projectName}}-main__footer-text" style="box-sizing:border-box;color:#{{colorDisclaimer}};font-size:8px;line-height:13px;font-weight:400;margin:0;">{{location}}</p><p class="{{projectName}}-main__footer-text" style="box-sizing:border-box;color:#{{colorDisclaimer}};font-size:8px;line-height:13px;font-weight:400;margin:0;">{{finalMessage}}</p></td></tr></tfoot></table><hr class="{{projectName}}-main__footer-line" style="box-sizing:border-box;height:4px;background-color:#{{colorFooterLine}};border:none;margin:0;"></body></html>';
	}

	/**
	 * For change the config of the template. The variables that will be replaced in template
	 * @returns {Object} Variables with values
	 */
	static get config() {
		return {
			projectName: this.githubUser?.projectName || 'REPOSITORY_NAME',
			githubUser: this.githubUser?.user || 'YOUR_USER',
			owner: this.githubUser?.owner || 'YOUR NAME',
			year: new Date().getFullYear(),
			colorBrand: this.colors?.brand || '303030',
			colorHover: this.colors?.hover || '6c2650',
			colorBackground: this.colors?.background || 'c7c7c7',
			colorDisclaimer: this.colors?.disclaimer || '303030',
			colorFooterLine: this.colors?.footerLine || '303030',
			banner: this.messages?.banner || 'https://sdtimes.com/wp-content/uploads/2020/04/1_oBm_3saYz4AI_MS6OekdFQ.png',
			location: this.messages?.location || 'Somewhere in Earth, Solar System, Milky War, Known Universe',
			finalMessage: this.messages?.finalMessage || 'Thank you!'
		};
	}

	/**
	 * For change github user data
	 * @returns {GithubUser}
	 */
	static get githubUser() {
		return {};
	}

	/**
	 * For change the colors of the template
	 * @returns {Colors}
	 */
	static get colors() {
		return {};
	}

	/**
	 * For change the messages of the template
	 * @returns {Messages}
	 */
	static get messages() {
		return {};
	}

	process() {
		const indexTemplate = Handlebars.compile(this.constructor.template);
		this.setHeader('Content-Type', 'text/html').setBody(indexTemplate(this.constructor.config));
	}
};
