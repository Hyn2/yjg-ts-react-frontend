import { useEffect, useRef, useState } from "react";
import FormInput from "./FormInput";
import { SubmitHandler, useForm } from "react-hook-form";
import { FindingFormValues, FindingPasswordValues } from "../../types/auth";
import { trimValues } from "../../utils/validate";
import { formatTime } from "../../utils/timer";
import { emailReg, nameReg, phoneNumReg } from "../../utils/regex";
import { useNavigate } from "react-router-dom";
import { publicApi } from "../../services/customAxios";
import { AxiosRequestConfig } from "axios";

function FindMyAccountForm(): JSX.Element {
  const {
    register,
    watch,
    handleSubmit,
    setError,
    formState: { errors },
    reset,
  } = useForm<FindingFormValues>();
  const userNameEmail = {
    name: watch("name"),
    email: watch("email"),
  };

  const navigate = useNavigate();
  // 아이디와 비밀번호 어느 쪽인지 저장
  const [findingAccount, setFindingAccount] = useState("findingId");
  // 인증번호 발송 체크
  const [sendCodeCheck, setSendCodeCheck] = useState(false);
  // 타이머 시작
  const [onTimer, setOnTimer] = useState(true);
  // 타이머 스테이트
  const [timer, setTimer] = useState<number>(180);
  const timerId = useRef<NodeJS.Timeout | null>(null);

  // 0초 일때 타이머 종료
  useEffect(() => {
    if (timer === 0 && timerId.current) {
      clearTimeout(timerId.current);
      setOnTimer(false);
    }
  }, [timer]);
  // 페이지 전환시 초기화
  useEffect(() => {
    reset();
    setSendCodeCheck(false);
    setOnTimer(true);
    if (timerId.current) {
      clearTimeout(timerId.current);
      setTimer(180);
    }
  }, [findingAccount]);

  // 타이머 함수
  const startTimer = () => {
    if (timerId.current) {
      clearTimeout(timerId.current);
    }
    setOnTimer(true);
    setTimer(180);
    timerId.current = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
  };

  // 인증번호 발송 api
  const sendCode = async (userData: FindingPasswordValues) => {
    // 존재하는 유저 정보인지 확인 후 인증번호 발송
    try {
      await publicApi.post("/api/reset-password", {
        name: userData.name,
        email: userData.email,
      });
      setSendCodeCheck(true);
      startTimer();
      setError("email", { message: "" }, { shouldFocus: true });
    } catch (error: any) {
      console.log(error);
      setError(
        "email",
        { message: "이메일과 이름을 다시 확인해주세요." },
        { shouldFocus: true }
      );
    }
  };

  // 아이디/비밀번호 찾기 제출 함수
  const onSubmit: SubmitHandler<FindingFormValues> = async (data) => {
    const trimData = trimValues(data);
    if (findingAccount === "findingId") {
      //아이디 찾기 제출
      try {
        const checkId = await publicApi.post("/api/find-email", {
          name: trimData.name,
          phone_number: trimData.phone,
        });
        const userData = {
          id: checkId.data.admin.id,
          name: checkId.data.admin.name,
          email: checkId.data.admin.email,
        };
        navigate("/findIdPw/result", {
          state: { state: "id", value: userData },
        });
      } catch (error: any) {
        console.log(error);
        setError(
          "name",
          { message: error.response.data.error },
          { shouldFocus: true }
        );
      }
    } else if (findingAccount === "findingPassword") {
      // 비밀번호 찾기 제출
      try {
        const config: AxiosRequestConfig = {
          params: {
            email: trimData.email,
            code: trimData.verificationCode,
          },
        };
        const checkPw = await publicApi.get(
          "/api/reset-password/verify",
          config
        );
        console.log(checkPw);
        navigate("/findIdPw/result", {
          state: { state: "pw", value: checkPw.data.email_token },
        });
      } catch (error) {
        console.log(error);
        setError(
          "verificationCode",
          { message: "인증번호가 일치하지 않습니다." },
          { shouldFocus: true }
        );
      }
    }
  };

  return (
    <>
      <div className="flex min-w-96 max-w-xl m-auto text-center font-bold">
        <div
          className={`${
            findingAccount === "findingId"
              ? "bg-sky-200/90"
              : "bg-sky-200/50 text-black/30"
          } flex-1 rounded-t-full py-3 cursor-pointer transition-all duration-500 ease-in-out`}
          onClick={() => {
            setFindingAccount("findingId");
          }}
        >
          아이디 찾기
        </div>
        <div
          className={`${
            findingAccount === "findingPassword"
              ? "bg-sky-200/90"
              : "bg-sky-200/50 text-black/30"
          } flex-1 rounded-t-full py-3 cursor-pointer transition-all duration-500 ease-in-out`}
          onClick={() => {
            setFindingAccount("findingPassword");
          }}
        >
          비밀번호 찾기
        </div>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col bg-sky-200/90 rounded-b-3xl  aspect-video p-10 min-w-96 max-w-xl m-auto "
      >
        {findingAccount === "findingId" ? (
          <>
            <FormInput
              type="text"
              name="name"
              label="이름"
              placeholder="이름 입력 (한글)"
              register={register("name", {
                required: "이름을 입력해주세요.",
                pattern: {
                  value: nameReg,
                  message: "한글로 2~5자를 입력해주세요.",
                },
              })}
              errorMessage={errors?.name && errors.name.message}
            />
            <FormInput
              type="tel"
              name="phone"
              label="전화번호"
              placeholder="휴대폰 번호 입력 ( '-' 제외 11자리 )"
              register={register("phone", {
                required: "전화번호를 입력해주세요.",
                pattern: {
                  value: phoneNumReg,
                  message: "11자리 숫자를 입력해주세요.",
                },
              })}
              errorMessage={errors?.phone && errors.phone.message}
            />
          </>
        ) : (
          <>
            <FormInput
              type="text"
              name="name"
              label="이름"
              placeholder="이름 입력 (한글)"
              register={register("name", {
                required: "이름을 입력해주세요.",
                pattern: {
                  value: nameReg,
                  message: "한글로 2~5자를 입력해주세요.",
                },
              })}
              errorMessage={errors?.name && errors.name.message}
            />
            <FormInput
              type="email"
              name="email"
              label="메일"
              placeholder="메일 입력"
              check={{
                textF: "인증번호",
                textT: "재전송",
                onCheck: () => {
                  sendCode(userNameEmail);
                },
                buttonState: sendCodeCheck,
              }}
              register={register("email", {
                required: "이메일을 입력해주세요.",
                pattern: {
                  value: emailReg,
                  message: "이메일 양식에 맞춰 입력해주세요.",
                },
              })}
              errorMessage={errors?.email && errors.email.message}
            />
            <FormInput
              type="text"
              name="verificationCode"
              placeholder="인증번호 입력"
              label="인증번호"
              check={{
                textT: formatTime(timer),
                textF: "인증만료",
                onCheck: () => {},
                buttonState: onTimer,
              }}
              register={register("verificationCode", {
                required: "인증번호를 입력해주세요.",
              })}
              errorMessage={
                errors?.verificationCode && errors.verificationCode.message
              }
            />
          </>
        )}
        <button
          className="rounded-xl bg-cyan-600 py-3 mt-10 text-xl font-bold uppercase text-white shadow-md transition-all hover:shadow-lg hover:shadow-black/10 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
          data-ripple-light="true"
        >
          {findingAccount === "findingId" ? "아이디 찾기" : "비밀번호 찾기"}
        </button>
        <div className="flex justify-center gap-2 mt-3">
          <div className="text-xs text-right pt-1 font-bold">
            이미 계정이 있나요?
          </div>
          <div
            className="text-xs text-right pt-1 font-bold underline-offset-2  hover:underline cursor-pointer"
            onClick={() => {
              navigate("/");
            }}
          >
            로그인
          </div>
        </div>
      </form>
    </>
  );
}

export default FindMyAccountForm;
