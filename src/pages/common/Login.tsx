import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainFooter } from "../../components/common/Footer";
import {
  IoCheckCircle,
  IoCloseCircle,
  IoLogo,
} from "../../components/icon/Icons";
import { useFormValidation } from "../../hooks/useFormValidation";
import { isPassword, isUsername } from "../../validators/validator";
import Spinner from "../../utils/loaders/Spinner";
import { useLoginMutation } from "../../redux/api/user.api";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { ResponseCommonType } from "../../types";
import { useSelector } from "react-redux";
import { IRootState } from "../../redux/store";

const Login = () => {
  
  const navigate = useNavigate();
  const [trigger] = useLoginMutation();

  const [showPass, setShowPass] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string>("");
  const { verified } = useSelector((state: IRootState) => state.user);

  useEffect(() => {
    document.title = "Log in • Instagram";
    if(verified){
      navigate('/')
    }
  }, [verified]);

  const {
    form,
    errors,
    onFormSubmit: onSubmit,
    onInputChange: onChange,
  } = useFormValidation({
    validations: {
      username: (value) => isUsername(value),
      password: (value) => isPassword(value),
    },
    onSubmit: async () => {
      try {
        setLoading(true);
        const { username, password } = form;
        const { data, error } = await trigger({ username, password });
        if (data) {
          setErr('');
          setLoading(false);
          return navigate('/');
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

  return (
    <div className="login-form">
      <form onSubmit={onSubmit}>
        <IoLogo />
        <h1> </h1>
        <div className="inp-grp">
          <input
            className={errors?.username?.res === false ? "error" : ""}
            value={form.username}
            onChange={onChange}
            name="username"
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
        <div className="inp-grp pass-grp">
          <input
            className={errors?.password?.res === false ? "error" : ""}
            value={password}
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
        <button disabled={loading}>{loading ? <Spinner /> : "Log in"}</button>
        {err.length ? <h5 className="server-err">{err}</h5> : undefined}
        <span onClick={()=>navigate('/reset-password')} className="forgot">Forgot password?</span>
      </form>
      <div>
        <h5>
          Don't have an account ?{" "}
          <span onClick={() => navigate("/signup")}>Sign up</span>
        </h5>
      </div>
      <MainFooter />
    </div>
  );
};

export default Login;
