// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

contract WakeMeCrypto {
    uint256 minimumRequiredStake = 0.05 ether;
    uint256 tolerance = 10 minutes;

    mapping(address => uint256) public stakes;
    mapping(address => uint256) public wakeUpDeadlines;

    event AlarmSet(
        address indexed caller,
        uint256 stake,
        uint256 timestamp,
        uint256 tolerance
    );
    event WokenUp(address indexed caller, uint256 wokenUpAt);

    function setAlarm(uint256 _timestamp) public payable {
        require(
            wakeUpDeadlines[msg.sender] < block.timestamp,
            "WakeMeCrypto: An alarm is already set"
        );
        require(
            msg.value >= minimumRequiredStake,
            "WakeMeCrypto: Not enough stake"
        );
        require(
            _timestamp > block.timestamp + tolerance,
            "WakeMeCrypto: Timestamp too soon"
        );
        stakes[msg.sender] = msg.value;
        wakeUpDeadlines[msg.sender] = _timestamp + tolerance;
        emit AlarmSet(msg.sender, msg.value, _timestamp, tolerance);
    }

    function wakeUp() public {
        require(wakeUpDeadlines[msg.sender] > 0, "WakeMeCrypto: No alarm set");
        require(
            block.timestamp <= wakeUpDeadlines[msg.sender],
            "WakeMeCrypto: Too late"
        );
        uint256 stake = stakes[msg.sender];
        stakes[msg.sender] = 0;
        wakeUpDeadlines[msg.sender] = 0;
        payable(msg.sender).transfer(stake);
        emit WokenUp(msg.sender, block.timestamp);
    }
}
