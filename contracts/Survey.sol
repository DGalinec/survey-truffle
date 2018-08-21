pragma solidity ^0.4.24;

contract Survey {

  struct Choice {
    uint id;
    string name;
    uint voteCount;
  }

  address public manager;

  string public surveyQuestion;
  
  mapping(uint => Choice) public choices;

  uint public choicesCount;

  mapping(address => bool) public voters;

  event votedEvent (uint indexed _choiceId);
  event addedChoiceEvent (string _newChoice);
  event addedQuestionEvent (string _question);

  constructor () public {
    manager = msg.sender;
  }

  function addChoice(string _name) public restricted {
    choicesCount++;
    choices[choicesCount] = Choice(choicesCount, _name, 0);
    emit addedChoiceEvent(_name);
  }

  function setSurveyQuestion(string _question) public restricted {
    surveyQuestion = _question;
    emit addedQuestionEvent(_question);
  }

  function vote (uint _choiceId) public {
    require(!voters[msg.sender]);
    require((_choiceId > 0) && (_choiceId <= choicesCount));
    choices[_choiceId].voteCount++;
    voters[msg.sender] = true;
    emit votedEvent(_choiceId);
  }

  modifier restricted() {
    require(msg.sender == manager);
      _;
  }
}