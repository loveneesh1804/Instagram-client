import { useEffect, useState } from "react";
import Sidebar from "../../components/main/Sidebar";
import { MainFooter } from "../../components/common/Footer";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "../../redux/store";
import { newLineStrFormat, Null, toOriginalStr } from "../../utlis";
import User from "../../assets/images/user.png";
import { useEditMutation } from "../../redux/api/user.api";
import Spinner from "../../utils/loaders/Spinner";
import { toast } from "../../utils/alert/Toast";
import { login } from "../../redux/slice/user.slice";
import MoHeader from "../../components/mobile/MoHeader";

const Edit = () => {
  const [name, setName] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [preview, setPreview] = useState<string>("");
  const [photo, setPhoto] = useState<File>();
  const [disable, setDisable] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);


  const { user } = useSelector((state: IRootState) => state.user);
  const isMobile = useSelector((state: IRootState) => state.mobile.open);

  const dispatch = useDispatch();
  const [editUser] = useEditMutation();

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const file = e.target.files[0];
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async()=>{
    try{
      setLoading(true);
      const formData = new FormData();
      if(name && name!==user.name) formData.append('name',name);
      if(bio!==user.bio) formData.append('bio',bio.length ? newLineStrFormat(bio) : Null);
      if(photo) formData.append('avatar',photo);

      const {data} = await editUser(formData);
      if(data){
        dispatch(login({ verified: true, user: data.data }));
        toast('Profile Saved');
        return setLoading(false);
      }else{
        toast("Something went wrong");
        return setLoading(false);
      }
    }catch{
      toast("Something went wrong");
      return setLoading(false);
    }
  }

  useEffect(() => {
    document.title = "Edit Profile • Instagram";
    setName(user.name);
    setBio(user.bio !== Null ? toOriginalStr(user.bio).join('\n') : "");
  }, []);

  useEffect(()=>{
    if(name===user.name && (user.bio!==Null ? bio===user.bio : !bio) && !photo){
      setDisable(true);
    }else if(!name){
      setDisable(true)
    }else{
      setDisable(false);
    }
  },[name,bio,photo])

  return (
    <>
      <div className="explore">
        {isMobile ? <MoHeader /> : undefined}
        <Sidebar />
        <main className="edit-profile-box">
          <div className="edit-profile">
            <h3>Edit Profile</h3>
            <div className="edit-photo">
              <div>
                <img
                  src={
                    user.avatar.url !== Null && !preview.length
                      ? user.avatar.url
                      : preview.length
                      ? preview
                      : User
                  }
                  alt="user-ico"
                />
                <div>
                  <b>{user.username}</b>
                  <span>{user.name}</span>
                </div>
              </div>
              <button>
                <input type="file" onChange={handlePhoto} />
                Change photo
              </button>
            </div>
            <div className="edit-name">
              <h4>Name</h4>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                type="text"
              />
            </div>
            <div className="edit-bio">
              <h4>Bio</h4>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Bio"
              ></textarea>
              <span>This will be part of your public profile.</span>
            </div>
            <button onClick={handleSubmit} disabled={disable || loading}>
              {loading ? <Spinner /> : "Submit"}
            </button>
          </div>
          <MainFooter />
        </main>
      </div>
    </>
  );
};

export default Edit;
