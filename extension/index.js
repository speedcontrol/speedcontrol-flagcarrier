'use strict';
const express = require('express');
const app = express();

module.exports = function(nodecg) {
	var users = nodecg.Replicant('users', {defaultValue:{}});

	app.post('/speedcontrol-flagcarrier', (req, res) => {
		// Will enforce the "allowedDevices" in the config, if present.
		// (This section sure does look messy).
		if (nodecg.bundleConfig &&
			nodecg.bundleConfig.allowedDevices &&
			Array.isArray(nodecg.bundleConfig.allowedDevices) &&
			nodecg.bundleConfig.allowedDevices.length &&
			!nodecg.bundleConfig.allowedDevices.includes(req.body.device_id)) {
				res.send('Device ID is not allowed to make changes.');
				return;
		}

		// Store the data in our storage.
		if (req.body.action === 'login') {
			// Create object for the group if needed.
			if (!users.value[req.body.group_id])
				users.value[req.body.group_id] = {};

			// Put tag data in, key'd by the position.
			users.value[req.body.group_id][req.body.tag_data.position] = req.body.tag_data;

			// Also send the request in a message.
			nodecg.sendMessage('login', req.body);

			res.send('You\'ve been logged in.');
		}

		// Request to clear the relevant data from our storage.
		else if (req.body.action === 'clear') {
			// Just recreate the group's object.
			users.value[req.body.group_id] = {};

			// Also send the request in a message.
			nodecg.sendMessage('clear', req.body);

			res.send('All users from this group have been cleared.');
		}
	});
	nodecg.mount(app);
}