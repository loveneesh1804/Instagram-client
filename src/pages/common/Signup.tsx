import { useEffect, useState } from "react";
import {
  IoCheckCircle,
  IoCloseCircle,
  IoLogo,
} from "../../components/icon/Icons";
import { MainFooter } from "../../components/common/Footer";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { IRootState } from "../../redux/store";
import {
  isMobileNo,
  isName,
  isPassword,
  isUsername,
} from "../../validators/validator";
import { useFormValidation } from "../../hooks/useFormValidation";
import Svg from "../../assets/images/verify.png";
import {
  useSendOtpMutation,
  useVerifyOtpMutation,
} from "../../redux/api/temp.api";
import Spinner from "../../utils/loaders/Spinner";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { ResponseCommonType } from "../../types";
import { useRegisterMutation } from "../../redux/api/user.api";
import { toast } from "../../utils/alert/Toast";

const Signup = () => {
  const { verified } = useSelector((state: IRootState) => state.user);
  const navigate = useNavigate();
  const [sendOtp] = useSendOtpMutation();
  const [verifyOtp] = useVerifyOtpMutation();
  const [registerUser] = useRegisterMutation();

  const [showPass, setShowPass] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [redirect, setRedirect] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [validOtp, setValidOtp] = useState<boolean>(false);
  const [resend, setResend] = useState<boolean>(false);


  useEffect(() => {
    document.title = "Sign up • Instagram";
    if (verified) {
      navigate("/");
    }
  }, [verified]);

  useEffect(() => {
    if (otp.length === 6 && /^\d{6}$/.exec(otp)) {
      setValidOtp(true);
    } else {
      setValidOtp(false);
    }
  }, [otp]);

  const {
    form,
    errors,
    onFormSubmit: onSubmit,
    onInputChange: onChange,
  } = useFormValidation({
    validations: {
      username: (value) => isUsername(value),
      password: (value) => isPassword(value),
      name: (value) => isName(value),
      mobile: (value) => isMobileNo(value),
    },
    onSubmit: async () => {
      try {
        setLoading(true);
        const { username } = form;
        const { data, error } = await sendOtp({ username });
        if (data) {
          setErr("");
          setLoading(false);
          toast(`We sent the confirmation code to your email ${username}`);
          return setRedirect(true);
        } else {
          const errMsg = (
            (error as FetchBaseQueryError).data as ResponseCommonType
          ).message;
          setErr(errMsg);
          return setLoading(false);
        }
      } catch (e) {
        setErr("Sorry something went wrong. Please try again.");
        return setLoading(false);
      }
    },
  });

  const verifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      setLoading(true);
      const { username,password,name } = form;
      const { data, error } = await verifyOtp({ username,otp });
      if (data?.success) {
        const {data} = await registerUser({username,password,name});
        if(data?.success){
          setErr('');
          setLoading(false);
          navigate('/');
          return toast('Thanks for signing up. Your account has been created');
        }else {
          setErr("Sorry, we're unable to register with the provided data.");
          return setLoading(false);
        }
      } else {
        const errMsg = (
          (error as FetchBaseQueryError).data as ResponseCommonType
        ).message;
        setErr(errMsg);
        return setLoading(false);
      }
    } catch (e) {
      setErr("Sorry something went wrong. Please try again.");
      return setLoading(false);
    }
  };

  const resendOtp = async()=>{
    try {
      setLoading(true);
      const { username } = form;
      const { data, error } = await sendOtp({ username });
      if (data) {
        setLoading(false);
        setResend(true);
        return toast(`We sent the confirmation code to your email ${form?.username}`);
      } else {
        const errMsg = (
          (error as FetchBaseQueryError).data as ResponseCommonType
        ).message;
        setLoading(false);
        return toast(errMsg);
      }
    } catch (e) {
      toast("Sorry something went wrong. Please try again.");
      return setLoading(false);
    }
  }

  return (
    <div className="login-form">
      {!redirect ? (
        <form onSubmit={onSubmit}>
          <IoLogo />
          <p>Sign up to see photos and videos from your friends.</p>
          <div className="inp-grp">
            <input
              className={errors?.mobile?.res === false ? "error" : ""}
              name="mobile"
              value={form.mobile}
              onChange={onChange}
              type="text"
              placeholder=" "
            />
            <span>Mobile Number</span>
            {errors?.mobile?.res === true && <IoCheckCircle />}
            {errors?.mobile?.res === false && <IoCloseCircle />}
          </div>
          {errors.mobile?.res === false ? (
            <label>{errors?.mobile.msg}</label>
          ) : undefined}

          <div className="inp-grp pass-grp">
            <input
              value={password}
              className={errors?.username?.res === false ? "error" : ""}
              name="password"
              onChange={(e) => {
                setPassword(e.target.value);
                onChange(e);
              }}
              type={showPass ? "text" : "password"}
              placeholder=" "
            />
            <span>Password</span>
            {errors?.password?.res === true && (
              <i style={{ right: password ? "25%" : "12%" }}>
                <IoCheckCircle />
              </i>
            )}
            {errors?.password?.res === false && (
              <i style={{ right: password ? "25%" : "12%" }}>
                <IoCloseCircle />
              </i>
            )}
            <b
              onClick={() => setShowPass(!showPass)}
              style={{ visibility: password.length ? "visible" : "hidden" }}
            >
              {showPass ? "Hide" : "Show"}
            </b>
          </div>
          {errors.password?.res === false ? (
            <label>{errors?.password.msg}</label>
          ) : undefined}

          <div className="inp-grp">
            <input
              className={errors?.name?.res === false ? "error" : ""}
              name="name"
              value={form.name}
              onChange={onChange}
              type="text"
              placeholder=" "
            />
            <span>Full Name</span>
            {errors?.name?.res === true && <IoCheckCircle />}
            {errors?.name?.res === false && <IoCloseCircle />}
          </div>
          {errors.name?.res === false ? (
            <label>{errors?.name.msg}</label>
          ) : undefined}

          <div className="inp-grp">
            <input
              className={errors?.username?.res === false ? "error" : ""}
              name="username"
              value={form.username}
              onChange={onChange}
              type="text"
              placeholder=" "
            />
            <span>Username</span>
            {errors?.username?.res === true && <IoCheckCircle />}
            {errors?.username?.res === false && <IoCloseCircle />}
          </div>
          {errors.username?.res === false ? (
            <label>{errors?.username.msg}</label>
          ) : undefined}
          <h6>
            By signing up, you agree to our <span>Terms , Privacy Policy</span>
            and <span>Cookies Policy .</span>
          </h6>
          <button disabled={loading}>
            {loading ? <Spinner /> : "Sign Up"}
          </button>
        </form>
      ) : (
        <form className="verify-form" onSubmit={verifyCode}>
          <img src={Svg} alt="envelop-ico" />
          <h4>Enter Confirmation Code</h4>
          <p className="mail-info">
            Enter the confirmation code we sent to
            {form?.username}. {!resend ? <span onClick={resendOtp} >Resend Code.</span> : undefined}
          </p>
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            type="text"
            placeholder="Confirmation Code"
          />
          <button disabled={!validOtp}>{loading ? <Spinner /> : "Next"}</button>
          <b onClick={() => setRedirect(false)}>Go back</b>
          {err.length ? <span className="err">{err}</span> : undefined}
        </form>
      )}
      <div>
        <h5>
          Have an account ?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </h5>
      </div>
      <MainFooter />
    </div>
  );
};

export default Signup;
