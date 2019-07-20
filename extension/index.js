'use strict';
const express = require('express');
const app = express();

module.exports = function(nodecg) {
	var users = nodecg.Replicant('users', {defaultValue:{}});

	var protocol = nodecg.config.ssl && nodecg.config.ssl.enabled ? 'https' : 'http';
	nodecg.log.info('FlagCarrier server has been started (Target URL: %s://%s/speedcontrol-flagcarrier).', protocol, nodecg.config.baseURL);

	app.post('/speedcontrol-flagcarrier', (req, res) => {
		// Will enforce the "allowedDevices" in the config, if present.
		// (This section sure does look messy).
		if (nodecg.bundleConfig &&
			nodecg.bundleConfig.allowedDevices &&
			Array.isArray(nodecg.bundleConfig.allowedDevices) &&
			nodecg.bundleConfig.allowedDevices.length &&
			!nodecg.bundleConfig.allowedDevices.includes(req.body.device_id)) {
				res.send('Device ID is not allowed to make changes.');
				nodecg.log.warn('Device ID %s tried to change users on FlagCarrier app but was denied.', req.body.device_id, req.body);
				return;
		}

		// Request to clear the relevant data from our storage.
		if (req.body.action === 'clear' || req.body.action === 'login_clear') {
			// Completely deletes the group's object.
			delete users.value[req.body.group_id];

			// Also send the request in a message.
			nodecg.sendMessage('clear', req.body);

			nodecg.log.info('The %s group was cleared using FlagCarrier app (DeviceID: %s).', req.body.group_id, req.body.device_id);
			res.send('All users from this group have been cleared.');
		}

		// Store the data in our storage.
		if (req.body.action === 'login' || req.body.action === 'login_clear') {
			// Create object for the group if needed.
			if (!users.value[req.body.group_id])
				users.value[req.body.group_id] = {};

			// Put tag data in, key'd by the position.
			users.value[req.body.group_id][req.body.position] = req.body.tag_data;

			// Also send the request in a message.
			nodecg.sendMessage('login', req.body);

			nodecg.log.info('%s logged in using FlagCarrier app (Group: %s, Position: %s, DeviceID: %s).', req.body.tag_data.display_name, req.body.group_id, req.body.position, req.body.device_id);
			res.send('You\'ve been logged in.');
		}
	});
	nodecg.mount(app);
}