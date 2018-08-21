App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function() {
    return App.initWeb3();
  },

  /* function that initialises our connection of our client side application to the local blockchain */
  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  /* 'initContract' loads up the contract so that we can intereact with it */
  initContract: function() {
    /* below getJSON function works for this "Survey.json" file because we are using the browsersync package */
    /* that came with the Truffle box. And our browsersync package is configured (~/survey-truffle/bs-config.json)   */
    /* to read JSON files out of the "./build/contracts" directory. The "./build/contracts/Survey.json"      */
    /* contains the ABI and the bytecode of the contract. */
    $.getJSON("Survey.json", function(survey) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Survey = TruffleContract(survey);
      // Connect provider to interact with contract
      App.contracts.Survey.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  listenForEvents: function() {
    // check if votedEvent occured
    App.contracts.Survey.deployed().then(function(instance) {
      //restart Chrome if you are unable to receive this event
      //this is a known issue with MetaMask
      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("votedEvent triggered", event);
        App.render();
      });
    });   
    
    // check if addedChoiceEvent occured
    App.contracts.Survey.deployed().then(function(instance) {
      //restart Chrome if you are unable to receive this event
      //this is a known issue with MetaMask
      instance.addedChoiceEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("addedChoiceEvent triggered", event);
        $("#input-choice").val(''); //clean input field
        App.render();
      });
    });
    
    // check if addedQuestionEvent occured
    App.contracts.Survey.deployed().then(function(instance) {
      //restart Chrome if you are unable to receive this event
      //this is a known issue with MetaMask
      instance.addedQuestionEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("addedQuestionEvent triggered", event);
        $("#input-title").val(''); //clean input field
        App.render();
      });
    });

    // check if account has changed in MetaMask
    var prevAccount = web3.eth.accounts[0];
    var accountInterval = setInterval(function() {
    if (web3.eth.accounts[0] !== prevAccount) {
      prevAccount = web3.eth.accounts[0];
      App.render();
    }
    }, 100);
    
  },
/*
  reloadPage: function () {
    $("#choicesResults").empty();
    $('#choicesSelect').empty();
    App.render();
  },
*/
  /* The 'render' function will layout all the content on the page */
  render: async () => {

    $("#loader").show();
    $("#content").hide();

    // Load account data
    web3.eth.getCoinbase((err, account) => {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html(account);
      }
    });

    // Load contract data
    try {
      let contractInstance = await App.contracts.Survey.deployed();
      let choicesCount = await contractInstance.choicesCount();
      choicesCount = choicesCount.toNumber();
      let hasVoted = await contractInstance.voters(App.account);
      const contractManager = await contractInstance.manager();
      let surveyQuestion = await contractInstance.surveyQuestion();

      $("#contractManager").html(contractManager);

      $("#choicesResults").empty();
      $('#choicesSelect').empty();

      surveyQuestion === "" ? $("#survey-title").html("Add a Question") : $("#survey-title").html(surveyQuestion);

      for (let i = 1; i <= choicesCount; i++) {
        let [id, name, voteCount] = await contractInstance.choices(i);

        // Render choice Result
        
        let choiceTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>";
        $("#choicesResults").append(choiceTemplate);
        

        // Render choice ballot option
        let choiceOption = "<option value='" + id + "' >" + name + "</ option>";
        $('#choicesSelect').append(choiceOption);
      }

      $("#loader").hide();
      $("#error-message").hide();
      $("#content").show();

      choicesCount > 0 ? $("#table-survey").show() : $("#table-survey").hide();
      choicesCount > 0 ? $("#create-survey").hide() : $("#create-survey").show();

      contractManager === App.account ? $("#add-choice").show() : $("#add-choice").hide();
      contractManager === App.account ? $("#add-title").show() : $("#add-title").hide();
      !hasVoted && choicesCount > 0 ? $("#form-vote").show() : $("#form-vote").hide();
    
    } catch (err) {
      $("#error-message").append(err.message);
      $("#error-message").show();
    }
  },

  addChoice: async () => {
    const newChoice = $("#input-choice").val();
    const contractInstance = await App.contracts.Survey.deployed();

    $("#error-message").empty();
    $("#error-message").hide();
    try {
      await contractInstance.addChoice(newChoice, { from: App.account });
     
      // Wait for adding the new choice
      $("#content").hide();
      $("#loader").show(); 
    } catch (err) {
      $("#error-message").append(err.message);
      $("#error-message").show();
    }
  },

  addTitle: async () => {
    const newTitle = $("#input-title").val();
    const contractInstance = await App.contracts.Survey.deployed();
    console.log("addChoice ", newTitle);

    $("#error-message").empty();
    $("#error-message").hide();
    try{
      await contractInstance.setSurveyQuestion(newTitle, { from: App.account });
     
      // Wait for adding the new choice
      $("#add-title").hide();
      $("#loader").show();
    } catch (err) {
      $("#error-message").append(err.message);
      $("#error-message").show();
    }
  },

  castVote: async () => {
    const contractInstance = await App.contracts.Survey.deployed();
    let choiceId = $('#choicesSelect').val();

    $("#error-message").empty();
    $("#error-message").hide();
    try {
      await contractInstance.vote(choiceId, { from: App.account });

      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();      
    } catch (err) {
      $("#error-message").append(err.message);
      $("#error-message").show();
    }
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
