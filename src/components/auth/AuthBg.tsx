import schoolBg from "../../assets/schoolImg/school.jpg";
import jwtLogo from "../../assets/schoolImg/simbol.png";

function AuthBg(props: { form: JSX.Element }): JSX.Element {
  const { form } = props;

  return (
    <div>
      <div
        className="h-screen bg-cover bg-center"
        style={{ backgroundImage: "url(" + schoolBg + ")" }}
      >
        <div className="flex justify-center bg-cyan-800/80 h-full  bg-auto overflow-scroll">
          <div>
            <img
              src={jwtLogo}
              alt="logo"
              className="absolute top-6 left-6 w-32 mb-6 hidden lg:block"
            />
          </div>
          <div className="flex-1 mt-20">{form}</div>
        </div>
      </div>
    </div>
  );
}

export default AuthBg;
