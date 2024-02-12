"use client";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { Contract } from "@ethersproject/contracts";
import { Web3Provider } from "@ethersproject/providers";
import { parseEther, formatEther } from "@ethersproject/units";
import relativeTime from "dayjs/plugin/relativeTime";
import { useAccount } from "wagmi";

import {
  DatePicker,
  Button,
  InputNumber,
  Space,
  message,
  Table,
  Typography
} from "antd";
import { SyncOutlined } from "@ant-design/icons";
const { Title } = Typography;

dayjs.extend(relativeTime);

const wakeMeCryptoContractAddress =
  "0xB3dbF9cfab1b6B257db5F51aF0440B45976c5f14";
const wakeMeCryptoContractABI = [
  "event AlarmSet(address indexed caller, uint256 stake, uint256 timestamp, uint256 tolerance)",
  "event WokenUp(address indexed caller, uint256 wokenUpAt)",
  "function setAlarm(uint256 _timestamp) payable",
  "function stakes(address) view returns (uint256)",
  "function wakeUp()",
  "function wakeUpDeadlines(address) view returns (uint256)"
];

const contract = new Contract(
  wakeMeCryptoContractAddress,
  wakeMeCryptoContractABI
);

function App() {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [provider, setProvider] = useState(null);
  const [alarmTimestamp, setAlarmTimestamp] = useState(0);
  const [amountToStake, setAmountToStake] = useState(0);
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState({
    setAlarm: false,
    wakeUp: false,
    data: false
  });

  const { address: account } = useAccount();

  const handleSetAlarm = async () => {
    if (!account || !provider)
      return message.error("Please connect wallet first");
    if (!alarmTimestamp) return message.error("Please select a date and time");
    if (amountToStake <= 0)
      return message.error("Please enter a valid amount to stake");
    setLoading({ ...loading, setAlarm: true });
    try {
      const signer = provider.getSigner();
      const amountToStakeInWei = parseEther(amountToStake?.toString());
      console.log({ amountToStakeInWei: amountToStakeInWei.toString() });
      const tx = await contract.connect(signer).setAlarm(alarmTimestamp, {
        value: amountToStakeInWei
      });
      await tx.wait();
      message.success("Alarm set!");
    } catch (e) {
      console.log("Error setting alarm", e);
      message.error("Error setting alarm");
    } finally {
      setLoading({ ...loading, setAlarm: false });
    }
  };

  const handleConfirmWakeUp = async () => {
    if (!account || !provider)
      return message.error("Please connect wallet first");
    setLoading({ ...loading, wakeUp: true });
    try {
      const signer = provider.getSigner();
      const tx = await contract.connect(signer).wakeUp();
      await tx.wait();
      message.success("Confirmed Woken up!");
    } catch (e) {
      console.log("Failed confirming wokeup", e);
      message.error("Failed confirming wokeup");
    } finally {
      setLoading({ ...loading, wakeUp: false });
    }
  };

  const getAlarms = async () => {
    if (!account || !provider)
      return message.error("Please connect wallet first");
    setLoading({ ...loading, data: true });
    try {
      const wakeUpDeadline = await contract
        .connect(provider)
        .wakeUpDeadlines(account);
      const stake = await contract.connect(provider).stakes(account);
      console.log({
        wakeUpDeadline: wakeUpDeadline.toString(),
        stake: stake.toString
      });
      const alarms =
        wakeUpDeadline.toString() === "0"
          ? []
          : [
              {
                deadline: wakeUpDeadline.toString(),
                stake: stake.toString()
              }
            ];
      setAlarms(alarms);
    } catch (e) {
      console.log("Failed to get alarm", e);
      message.error("Failed to get alarm");
    } finally {
      setLoading({ ...loading, data: false });
    }
  };

  useEffect(() => {
    if (account) {
      const provider = new Web3Provider(window.ethereum);
      setProvider(provider);
    }
  }, [account]);

  useEffect(() => {
    // Function to update time and date

    const updateTimeAndDate = () => {
      const currentTime = dayjs().format("h:mm:ss A");
      const currentDate = dayjs().format("dddd, MMMM D, YYYY");

      setCurrentTime(currentTime);
      setCurrentDate(currentDate);
    };

    // Update time and date every second
    const intervalId = setInterval(updateTimeAndDate, 1000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (account && provider) {
      getAlarms();
    }
  }, [account, provider]);

  useEffect(() => {
    // Request notification permission when the component mounts
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          // Permission granted, you can now display notifications
          new Notification("Welcome to WakeMeCrypto!", {
            body: "You will now receive notifications when your alarm is about to go off.",
            timestamp: dayjs().unix()
          });
        }
      });
    }
  }, []);

  useEffect(() => {
    // Check if the alarm is set to trigger within the next 10 minutes
    if (
      alarmTimestamp &&
      dayjs.unix(alarmTimestamp).diff(dayjs(), "minute") <= 10
    ) {
      // Display a notification with actions
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("WakeMe Crypto", {
            body: "Your alarm is about to go off!. Click here to stop it or else you will lose your stake."
          });
        } else if (Notification.permission !== "denied") {
          // Request notification permission
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              // Permission granted, you can now display notifications
              new Notification("Welcome to WakeMeCrypto!", {
                body: "You will now receive notifications when your alarm is about to go off.",
                timestamp: dayjs().unix()
                // actions: [
                //   { action: "stop", title: "Stop" },
                //   { action: "snooze", title: "Snooze" }
                // ]
              });
            }
          });
        }
      }
    }
  }, [alarmTimestamp]);

  const columns = [
    {
      title: "Deadline",
      dataIndex: "deadline",
      key: "deadline",
      render: (deadline) => {
        const date = dayjs.unix(deadline);
        return (
          <span>
            {date.format(" h:mm A MMM D, YYYY")}
            <br />
            {date.fromNow()}
          </span>
        );
      }
    },
    {
      title: "Stake",
      dataIndex: "stake",
      key: "stake",
      render: (stake) => `${formatEther(stake)} MATIC`
    },
    {
      title: "Actions",
      key: "actions",
      render: () => (
        <Button
          type="primary"
          loading={loading.wakeUp}
          onClick={handleConfirmWakeUp}
        >
          Stop
        </Button>
      )
    }
  ];

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "10px"
      }}
    >
      <div className="card">
        <h1>{currentTime}</h1>
        <h2>{currentDate}</h2>
      </div>
      {account ? (
        <div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              marginTop: "20px",
              marginBottom: "20px"
            }}
          >
            <Title level={4}>Set Alarm</Title>
            <Space direction="horizontal">
              <DatePicker
                placeholder="Select date and time"
                format="h:mm A MMM D, YYYY"
                showTime={{
                  hideDisabledOptions: true,
                  defaultValue: dayjs("00:00:00", "HH:mm:ss")
                }}
                disabledDate={(current) => {
                  const today = dayjs().startOf("day");
                  return current && current < today;
                }}
                onChange={(date) => {
                  console.log({ ts: date?.unix() });
                  setAlarmTimestamp(date?.unix());
                }}
              />
              <InputNumber
                min={0}
                max={100}
                placeholder="Amount to stake"
                addonAfter="MATIC"
                onChange={(val) => setAmountToStake(val)}
              />
              <Button
                type="primary"
                loading={loading.setAlarm}
                onClick={handleSetAlarm}
              >
                Set Alarm
              </Button>
            </Space>
          </div>
          <div>
            <Space direction="horizontal">
              <Title level={4}>Current Alarms</Title>
              <Button
                shape="circle"
                type="primary"
                icon={<SyncOutlined spin={loading.data} />}
                loading={loading.data}
                onClick={getAlarms}
              />
            </Space>
            <Table
              dataSource={alarms}
              columns={columns}
              loading={loading.data}
              rowKey={(record) => record.deadline}
            />
          </div>
        </div>
      ) : (
        <div>
          <h2
            style={{
              textAlign: "center",
              marginTop: "40px"
            }}
          >
            Please connect your wallet to get started!
          </h2>
        </div>
      )}
    </div>
  );
}

export default App;
