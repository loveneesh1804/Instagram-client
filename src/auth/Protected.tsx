import { Outlet, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLazyMyProfileQuery } from '../redux/api/user.api';
import { login, logout } from '../redux/slice/user.slice';
import { IRootState } from '../redux/store';

const Protected = ():JSX.Element => {
  const dispatch = useDispatch();
  const [trigger] = useLazyMyProfileQuery();
  const { verified } = useSelector((state: IRootState) => state.user);

  useEffect(() => {
    const verify = async () => {
      try {
        const { data, error } = await trigger("");
        if (!data?.success || error) {
          return dispatch(logout());
        }
        return dispatch(login({verified : true,user : data.user}))
      } catch (e) {
        return dispatch(logout());
      }
    };
    verify();
  }, [dispatch]);

  return verified ? <Outlet /> : <Navigate to={'/login'} />  ;
}

export default Protected; 