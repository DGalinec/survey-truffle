const Survey = artifacts.require("./Survey.sol");

let instance;
let accounts;

beforeEach(async () => {
    instance = await Survey.deployed();
    contract("Survey", (acc) => { accounts = acc; });
})

describe('Survey contract tests', () => {

    it("number of choices is equal to 0", async () => {
        const nbChoices = await instance.choicesCount();
        assert.equal(nbChoices, 0);
    });

    it("contract manager sets survey question and it emits an event", async () => {
        const managerAdr = await instance.manager();
        const receipt = await instance.setSurveyQuestion("Elections 2018", { from: managerAdr });
        const readQuestion = await instance.surveyQuestion();
        assert.equal(readQuestion, "Elections 2018")
        //test event
        assert.equal(receipt.logs.length, 1);
        assert.equal(receipt.logs[0].event, "addedQuestionEvent");
        assert.equal(receipt.logs[0].args._question, "Elections 2018");
    });

    it("only the contract manager can change the survey question", async () => {
        try {
            await instance.setSurveyQuestion("Monsieur Univers", { from: accounts[3] });
            console.log("      NO ANY ERROR RAISED");
            assert(false);
        } catch (err) {
            assert(err);
            if (err.message.indexOf('revert') < 0) {
                assert(false);
            }
        }
    });

    it("votes for choice 1 and emits event", async () => {
        //add 'choice 1'
        const managerAdr = await instance.manager();
        await instance.addChoice("Choice 1", { from: managerAdr });
        //vote for 'choice 1'
        const receipt = await instance.vote(1, { from: accounts[0] });
        const choice = await instance.choices(1);
        assert.equal(choice[2], 1);
        const voted = await instance.voters(accounts[0]);
        assert.equal(voted, true);
        //test event
        assert.equal(receipt.logs.length, 1);
        assert.equal(receipt.logs[0].event, "votedEvent");
        assert.equal(receipt.logs[0].args._choiceId.toNumber(), 1);
    });

    it("throws an exception for invalid choice id", async () => {           
        let nbChoices = await instance.choicesCount();
        nbChoices = nbChoices.toNumber();
        try {
            await instance.vote(nbChoices+1, { from: accounts[1] });
            console.log("      NO ANY ERROR RAISED");
            assert(false);
        } catch (err) {
            assert(err);
            if (err.message.indexOf('revert') < 0) {
                assert(false);
            }
        } 
    });

    it("throws an exception for double voting", async () => {
        await instance.vote(1, { from: accounts[2] });
        let choice = await instance.choices(1);
        let beforeCount = choice[2].toNumber();
        try {
            await instance.vote(1, { from: accounts[2] });
            console.log("      NO ANY ERROR RAISED");
            assert(false);
        } catch (err) {
            assert(err);
            if (err.message.indexOf('revert') < 0) {
                assert(false);
            }
        }
        choice = await instance.choices(1);
        let afterCount = choice[2].toNumber();
        assert.equal(beforeCount - afterCount, 0);
    });

    it("contract manager adds a new choice and emits an event", async () => {
        //create 'candidate 2'
        const managerAdr = await instance.manager();
        const receipt = await instance.addChoice("Choice 2", { from: managerAdr });
        let nbChoices = await instance.choicesCount();
        nbChoices = nbChoices.toNumber();
        assert.equal(nbChoices, 2);
        const [id, name, voteCount] = await instance.choices(nbChoices);
        assert.equal(id, nbChoices);
        assert.equal(name, "Choice 2");
        assert.equal(voteCount, 0);
        //test event
        assert.equal(receipt.logs.length, 1);
        assert.equal(receipt.logs[0].event, "addedChoiceEvent");
        assert.equal(receipt.logs[0].args._newChoice, "Choice 2");
    });

    it("only the contract manager can add a new choice", async () => {
        try {
            await instance.addChoice("Choice X", { from: accounts[3] });
            console.log("      NO ANY ERROR RAISED");
            assert(false);
        } catch (err) {
            assert(err);
            if (err.message.indexOf('revert') < 0) {
                assert(false);
            }
        }
    });
});