import { useNavigate } from "react-router-dom";
import { ListBtn, ListHead, UserList } from "../../master/UserList";
import CountCard from "../../salon/CountCard";
import { customAxios } from "../../../services/customAxios";
import { useEffect, useState } from "react";
import { AxiosRequestConfig } from "axios";
import {
  NoticeListType,
  getAfterServiceType,
  getNoticeDataType,
} from "../../../types/post";
import Pagination from "../../post/page/Pagination";
import SearchBar from "../../post/page/SearchBar";
import dayjs from "dayjs";
import { GetReservationDataType } from "../../../types/admin";

function AdminMain() {
  const headList = [
    { value: "제목", col: "col-span-4" },
    { value: "태그", col: "col-span-1" },
    { value: "", col: "col-span-1" },
  ];
  const dataList = [
    { value: "title", col: "col-span-4" },
    { value: "tag", col: "col-span-1" },
    [
      {
        value: "조회",
        color: "bg-cyan-500",
        onClick: (user: NoticeListType) => {
          navigate(`/main/admin/reading/${user.id}`, {
            state: { type: "Post" },
          });
        },
      },
    ],
  ];
  // 공지사항 데이터 값
  const [noticeList, setNoticeList] = useState<NoticeListType[]>([]);
  // 태그 리스트
  const tagList = [
    { value: "", name: "제목" },
    { value: "admin", name: "행정" },
    { value: "salon", name: "미용실" },
    { value: "restaurant", name: "식당" },
    { value: "bus", name: "버스" },
  ];
  // 검색 바 태그 값
  const [tag, setTag] = useState("");
  // 검색 바 제목 값
  const [search, setSearch] = useState("");
  // 공지사항 페이지 값
  const [page, setPage] = useState(1);
  // 공지사항 마지막 페이지 값
  const [lastPage, setLastPage] = useState(8);
  // 금일 외박 신청 수
  const [sleepMember, setSleepMember] = useState(0);
  // 금일 외출 신청 수
  const [goMember, setGoMember] = useState(0);
  // 금일 회의실 예약 수
  const [roomReservation, setRoomReservation] = useState(0);
  // A/S 미처리 건 신청 수
  const [unprocessedCase, setUnprocessedCase] = useState(0);
  const navigate = useNavigate();

  //페이지 렌더링 시
  useEffect(() => {
    let currentDate = dayjs(new Date()).format("YYYY-MM-DD");
    getCountData({ date: currentDate });
    getASData({ status: 0, page: 1 });
    getReservationData({ date: currentDate });
  }, []);

  // 검색 바 데이터 변경 시
  useEffect(() => {
    if (page === 1) {
      let data: getNoticeDataType = { page: 1 };
      if (tag) {
        data = { ...data, tag: tag };
      }
      if (search) {
        data = { ...data, title: search };
      }
      getNoticeListData(data);
    }
    setPage(1);
  }, [tag, search]);

  // 페이지 변경 시
  useEffect(() => {
    let data: getNoticeDataType = { page: page };
    if (tag) {
      data = { ...data, tag: tag };
    }
    if (search) {
      data = { ...data, title: search };
    }
    getNoticeListData(data);
  }, [page]);

  // 공지사항 데이터 가져오기
  const getNoticeListData = async (data: getNoticeDataType) => {
    try {
      const config: AxiosRequestConfig = {
        params: data,
      };
      const notice = await customAxios.get("/api/notice", config);
      setNoticeList(notice.data.notices.data);
      setLastPage(notice.data.notices.last_page);
    } catch (error) {
      console.log(error);
    }
  };

  // 외출, 외박 신청자 수 가져오기
  const getCountData = async (data: { date: string }) => {
    try {
      const config: AxiosRequestConfig = { params: data };
      const countData = await customAxios.get("/api/absence/count", config);
      setGoMember(countData.data.go_count);
      setSleepMember(countData.data.sleep_count);
    } catch (error) {
      console.log(error);
    }
  };

  // 회의실 예약자 리스트 가져오기
  const getReservationData = async (data: GetReservationDataType) => {
    try {
      const config: AxiosRequestConfig = {
        params: data,
      };
      const reservationData = await customAxios.get(
        "/api/meeting-room/reservation",
        config
      );
      setRoomReservation(reservationData.data.reservations.total);
    } catch (error) {
      console.log(error);
    }
  };

  // AS 데이터 가져오기
  const getASData = async (data?: getAfterServiceType) => {
    try {
      const config: AxiosRequestConfig = {
        params: data,
      };
      const ASData = await customAxios.get("/api/after-service", config);
      setUnprocessedCase(ASData.data.after_services.total);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex gap-7 pr-10">
      <div className="flex flex-col ml-4">
        <CountCard header="외박 신청자" count={sleepMember} />
        <CountCard header="외출 신청자" count={goMember} />
        <CountCard header="회의실 예약자" count={roomReservation} />
        <CountCard header="미처리 A/S건" count={unprocessedCase} />
      </div>
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center gap-4  font-bold text-3xl pr-4">
          <div>공지사항</div>
          <div className="flex-1 flex justify-center">
            <SearchBar
              tag={tag}
              tagList={tagList}
              setTag={setTag}
              setSearch={setSearch}
            />
          </div>
          <ListBtn
            value="작성"
            color="bg-cyan-600"
            onClick={() => {
              navigate("/main/admin/writing", { state: { type: "Post" } });
            }}
          />
        </div>
        <div className="grid grid-cols-6 border-x border-black/10 shadow-lg overflow-hidden rounded-2xl">
          {<ListHead headList={headList} />}
          {noticeList.map((user) => {
            return <UserList user={user} dataList={dataList} />;
          })}
        </div>
        <Pagination page={page} setPage={setPage} lastPage={lastPage} />
        <div className="text-center font-bold text-xs">{`1 - ${lastPage}`}</div>
      </div>
    </div>
  );
}

export default AdminMain;