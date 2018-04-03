var person = {
	email : 'asong@uog.com'
}

try {
	var pwSdkObj = PWSDK.init();
} catch(err) {
	console.log(err);	
}

$(function() {
	
	if (pwSdkObj) {
		pwSdkObj.setAppUI({height: 300	});
		pwSdkObj.getContext().then(function(data) {
			person.email = data.context.primary_email;
			fetchSFDCInfo(person);
			console.log('CONTEXT OBJECT:' + data.context);
		});
	}

	sfdcTicketsList = new Vue({
		el: '#sfdcTicketsList',
		data: {
			user: '',
			items: [],
			status: 'new',
			newTicketUrl: 'https://na50.lightning.force.com/one/one.app#/sObject/Case/new?count=1',
			baseOrgUrl: 'https://na50.lightning.force.com/'
		}
	})

	function fetchSFDCInfo(person){
		$.ajax({
		type: 'GET',
		dataType: 'json',
		data: person,
		url: '/sfdcinfo',
		success: function(result) {
			sfdcTicketsList.status = 'success';
			sfdcTicketsList.cases = [];
			var cases = result[0].Cases.records;
			console.log(cases);
			$.each(cases, function(index){
				console.log('in each loop');

				var ticketUrl = sfdcTicketsList.baseOrgUrl + cases[index].Id;

				var created = new Date(cases[index].CreatedDate);
				var created_formatted = 
					created.getMonth()+1 + '-' + 
					created.getDate() + '-' + 
					created.getFullYear();

				sfdcTicketsList.items.push({
					ticketId : cases[index].CaseNumber,
					subject : cases[index].Subject,
					status : cases[index].Status, 
					priority : cases[index].Priority,
					type : cases[index].Origin,
					created : created_formatted,
					url : ticketUrl
				});
			})

			if (pwSdkObj) { pwSdkObj.setAppUI({ count: sfdcTicketsList.items.length }); }

		},

		error: function(result) {
			console.log(result);
			sfdcTicketsList.status = 'error';
		}

		});
	}

	function capitalizeFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	function fetchZendeskTicketsByEmail(person){
		$.ajax({
		type: 'GET',
		dataType: 'json',
		data: person,
		url: '/zeninfo',
		success: function(result) {
			console.log(result);
			zenTicketsList.status = 'success';
			zenTicketsList.items = [];
			$.each(result, function(index){

				var ticketUrl = result[index].url.replace('/api/v2', '').replace('.json','');
				var user = result[index].requester_id
				var created = new Date(result[index].created_at);
				var created_formatted = 
					created.getMonth()+1 + '-' + 
					created.getDate() + '-' + 
					created.getFullYear();
				
				zenTicketsList.items.push({
					ticketId : result[index].id,
					subject : result[index].raw_subject, 
					priority : result[index].priority, 
					url : result[index].url, 
					status : result[index].status,
					type : result[index].type,
					description : result[index].description,
					tags : result[index].tags,
					url : ticketUrl,
					created : created_formatted
				});

				if(zenTicketsList.user == '') { zenTicketsList.user = user; }

			});
		},

		error: function(result) {
			console.log(result);
			zenTicketsList.status = 'error';
		}

		});
	}

	//$("button").on("click", fetchZendeskTicketsByEmail(person.email));

	if (!pwSdkObj) {
		console.log('no context object...fetching tickets for default email:' + person.email)
		fetchSFDCInfo(person);
	}

});

