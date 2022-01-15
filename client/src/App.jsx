import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useWeb3 } from "@3rdweb/hooks";
import { ThirdwebSDK } from "@3rdweb/sdk";
import { UnsupportedChainIdError } from "@web3-react/core";
import { ethers } from 'ethers';
import "./App.css";
import BookingContract from './contracts/Booking.json';

// Deployed to Kovan: 0x966494b6e7920530c6F093cC37e50488466839DC
// Timestamp already passed: 1642270684

const App = () => {
  const sdk = new ThirdwebSDK("rinkeby");
  const { connectWallet, address, error, provider } = useWeb3();
  const signer = provider ? provider.getSigner() : undefined;
  const [isBooking, setIsBooking] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [isMember, setIsMember] = useState(false);

  const cokeModule = sdk.getBundleDropModule("0xB0403DB21E82587D3E40341577bcA250C9F7bE82");
  const contractAddress = "0x4820f9A4261aad5dC60153B3d2d53C3628E5909E";
  let bookingContract;

  if (signer) {
    bookingContract = new ethers.Contract(
      contractAddress,
      BookingContract.abi,
      signer
    );
  }

  async function getTimeData(roomId, times) {
    const timeSlots = await Promise.all(times.map(async (time) => {
      const bookingId = roomId + '-' + time;
      const booking = await bookingContract.checkAvailability(bookingId);
      return { 'available': booking[0], 'address': booking[1], 'time': time, 'roomId': roomId };
    }));
    return timeSlots;
  } 

  async function listTimes(roomId) {
    try {
      const times = await bookingContract.listTimes();
      const timeSlots = await getTimeData(roomId, times);
      setTimeSlots(timeSlots);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (!address) {
      return;
    }
    
    cokeModule
    .balanceOf(address, "0")
    .then((balance) => {
      if (balance.gt(0)) {
        setIsMember(true);
      } else {
        setIsMember(false);
      }
    })
    .catch((error) => {
      setIsMember(false);
    });
  }, [address, cokeModule]);

  useMemo(() => {
    if (!signer) {
      return;
    }

    bookingContract.listRooms()
    .then((rs) => {
      setRooms(rs);
    });
  }, [provider]);

  if (error instanceof UnsupportedChainIdError ) {
    return (
      <div className="unsupported-network">
        <h2>Please connect to Rinkeby</h2>
        <p>
          The room booking service is only available in the Rinkeby network for now, please switch networks
          in your connected wallet.
        </p>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="landing">
        <h1>SportsBetX</h1>
        <button onClick={() => connectWallet("injected")} className="btn-hero">
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
  <div className="member-page">
    <h1>It's COLA Day</h1>
    <div>
      <div>
          <h2>Room List</h2>
          <table className="card">
            <thead>
              <tr>
                <th>Room #</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => {
                return (
                  <tr key={room}>
                    <td>
                    <button className="room-item" value={room} onClick={() => listTimes(room)}>
                      {room}
                    </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div id="availableSlotsDiv">
          <h2>Available Times</h2>
          <table className="card">
            <thead>
              <tr>
                <th>Time Slot</th>
              </tr>
            </thead>
            <tbody id="availabletimesTBody">
              {timeSlots.map((slot) => {
                return (
                  <tr key={slot.time}>
                    <td>
                      <TimeSlot
                        roomId={slot.roomId}
                        timeSlot={slot.time}
                        address={slot.address}
                        available={slot.available}
                        requesterAddress={address}
                        bookingContract={bookingContract}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
    </div>
  </div>
  );
};

export default App;
