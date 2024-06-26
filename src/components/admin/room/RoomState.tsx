import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { GetCheckRoomType, RoomStateType } from "../../../types/admin";
import { AxiosRequestConfig } from "axios";
import { privateApi } from "../../../services/customAxios";
import PeopleIcon from "../../../icons/PeopleIcon";
import closeImg from "../../../assets/close.png";

function RoomState(props: RoomStateType) {
  const { room, setRoom } = props;
  // 현재 시간의 예약 상태
  const [exist, setExist] = useState(false);
  // 예약된 시간 리스트
  const [reservedTimes, setReservedTimes] = useState<string[]>([]);

  // 렌더링 시
  useEffect(() => {
    const formattedDate = dayjs(new Date()).format("YYYY-MM-DD");
    getCheckData({ date: formattedDate, room_number: room.room_number });
  }, []);

  // reservedTimes 상태 변경 시
  useEffect(() => {
    checkReservation();
  }, [reservedTimes]);

  // 특정 회의실 특정 날짜 예약 목록 가져오기
  const getCheckData = async (data: GetCheckRoomType) => {
    try {
      const config: AxiosRequestConfig = {
        params: data,
      };
      const checkData = await privateApi.get("/api/meeting-room/check", config);
      setReservedTimes(checkData.data.reservations);
    } catch (error) {
      console.log(error);
    }
  };

  // 현재 시간에 예약이 존재하는지 체크하기
  const checkReservation = () => {
    let currentDate = dayjs(new Date()).format("HH:00");
    if (reservedTimes.includes(currentDate)) {
      setExist(true);
    }
  };

  return (
    <div
      className={`${
        exist
          ? "border-4 border-blue-500 text-blue-500"
          : "border-2 border-gray-300 text-gray-400 hover:border-2 hover:border-sky-500"
      } flex flex-col p-2 font-bold h-28 cursor-pointer hover:bg-sky-700/30 shadow-md`}
      onClick={() => {
        setRoom(room);
      }}
    >
      <div>{room.room_number}</div>
      {exist ? <PeopleIcon /> : null}
      {room.open ? null : (
        <div className="flex-1 flex items-center justify-center text-lg">
          <img className="w-1/2" src={closeImg} alt="close" />
        </div>
      )}
    </div>
  );
}

export default RoomState;
