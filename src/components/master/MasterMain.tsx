import { useEffect, useState } from "react";
import { privateApi } from "../../services/customAxios";
import { GetUserData } from "../../types/auth";
import { ListHead, UserList } from "./UserList";
import { GetApprovedData } from "../../types/master";
import { AxiosRequestConfig } from "axios";

function MasterMain() {
  const headList = [
    { value: "이름", col: "col-span-1" },
    { value: "전화번호", col: "col-span-1" },
    { value: "메일주소", col: "col-span-2" },
    { value: "승인처리", col: "col-span-1" },
  ];
  const dataList = [
    { value: "name", col: "col-span-1" },
    { value: "phone_number", col: "col-span-1", type: "phoneNum" },
    { value: "email", col: "col-span-2" },
    [
      {
        value: "승인",
        color: "bg-blue-400/90",
        onClick: (data: GetUserData) => {
          approval(data.id).then(() => {
            getData({ type: "unapproved" });
          });
        },
      },
      {
        value: "거절",
        color: "bg-red-400/90",
        onClick: (data: GetUserData) => {
          if (window.confirm("거절하시겠습니까?")) {
            alert("거절되었습니다");
            deleteData(data.id).then(() => {
              getData({ type: "unapproved" });
            });
          } else {
            alert("취소되었습니다.");
          }
        },
      },
    ],
  ];
  const [unapprovedUsers, setUnapprovedUsers] = useState<GetUserData[]>([]);
  useEffect(() => {
    getData({ type: "unapproved" });
  }, []);

  // 미승인 유저데이터 가져오기
  const getData = async (data: GetApprovedData) => {
    try {
      const config: AxiosRequestConfig = {
        params: data,
      };
      const unapprovedData = await privateApi.get("/api/admin/list", config);
      setUnapprovedUsers(unapprovedData.data.admins);
    } catch (error) {
      console.log(error);
    }
  };

  // 유저 데이터 승인요청
  const approval = async (data: number) => {
    try {
      await privateApi.patch("/api/admin/approve", {
        admin_id: data,
        approve: 1,
      });
    } catch (error) {
      console.log(error);
    }
  };

  // 유저데이터 거절 삭제하기
  const deleteData = async (data: number) => {
    try {
      await privateApi.delete(`/api/admin/master/${data}`);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="px-10 h-full">
      <div className="flex">
        <div className="flex-1 text-2xl font-bold tracking-tighter text-left">
          관리자 승인 대기 리스트
        </div>
        <div className="self-end text-right p-4 font-bold tracking-widest">
          {unapprovedUsers.length}명
        </div>
      </div>
      <div className="bg-white p-4 h-5/6 rounded-2xl overflow-auto shadow-lg">
        <div className="grid grid-cols-5 text-center border-x border-black/10 shadow-lg overflow-hidden rounded-2xl">
          <ListHead headList={headList} />
          {unapprovedUsers.map((user) => {
            return <UserList user={user} dataList={dataList} />;
          })}
        </div>
      </div>
    </div>
  );
}

export default MasterMain;
