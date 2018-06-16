'use strict';
$(() => {
	var users = nodecg.Replicant('users', 'speedcontrol-flagcarrier');

	// What we do when the users data is updated.
	users.on('change', (newVal, oldVal) => {
		$('#usersContainer').empty(); // Empty the container on the page.

		// If no one is logged in, display a different message.
		if (!newVal || jQuery.isEmptyObject(newVal)) {
			$('#usersContainer').html('No users are currently logged in.');
			return;
		}

		// Looping through all of the groups.
		$.each(newVal, (groupName, data) => {
			$('#usersContainer').append(createGroupContainer(groupName, data));
		});
	});

	// Creates the container that holds the information for each group.
	function createGroupContainer(groupName, data) {
		var container = $('<div class="groupContainer">');
		container.append('<div class="groupName">'+groupName+'</div>');
		
		// Looping through all of the positions.
		$.each(data, (positionName, data) => {
			container.append(createPositionContainer(positionName, data));
		});

		return container;
	}

	// Creates the container that holds the information for each position.
	function createPositionContainer(positionName, data) {
		var container = $('<div class="positionContainer">');
		container.append('<div class="positionName">'+positionName+':</div>');

		var userDataContainer = $('<div>');

		// Add display name.
		userDataContainer.append(data.display_name+' (<img src="https://www.speedrun.com/images/flags/'+data.country_code.toLowerCase()+'.png" title="Country"> '+data.country_code+')');

		// Only adds these types of data if they exist.
		if (data.twitch_name)
			userDataContainer.append('<br><img src="img/twitch.png" title="Twitch"> '+data.twitch_name);
		if (data.speedruncom_name)
			userDataContainer.append('<br><img src="img/speedruncom.png" title="speedrun.com"> '+data.speedruncom_name);
		if (data.twitter_handle)
			userDataContainer.append('<br><img src="img/twitter.png" title="Twitter"> '+data.twitter_handle);

		container.append(userDataContainer);
		return container;
	}
});