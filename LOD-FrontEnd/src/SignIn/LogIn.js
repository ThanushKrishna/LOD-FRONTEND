import { Card, Typography, Paper, Box, AppBar, TextField, Divider, Button, Dialog, DialogContent, ToggleButtonGroup, ToggleButton, IconButton} from "@mui/material"
import { Stack } from "@mui/system"
import { useEffect, useState } from "react"
import OtpVerificationComponent from "../Register/OtpVerification"
import Input from "../control/input"
import { useNavigate } from "react-router"
import axios from "axios"
import { useDispatch } from 'react-redux';
import { authActions } from '../store/authSlice';
import { dialogActions } from "../store/logInRegisterDialogSlice"
import jwtDecode from "jwt-decode"
import { logInByEmailUrl, logInByPhoneUrl } from "../constants/url"
import { cartActions } from "../store/cartSlice"

const LogIn = (props)=>{

    const dispatch = useDispatch()

    const [phoneNumberVerification, setPhoneNumberVerification] = useState(false)
    const [emailVerification, setEmailVerification] = useState(false)

    const [phoneNumber, setPhoneNumber] = useState("")
    const [otp, setOtp] = useState("")
    const [showOtpComponent, setShowOtpComponent] = useState(false)
    const [otpVerified, setOtpVerified] = useState(false)
    const [otpVerificationMessage, setOtpVerificationMessage] = useState("")


    const [emailId, setEmailId] = useState("")
    const [password, setPassword] = useState("")
    const[emailVerificationMsg, setEmailVerificationMsg] = useState("")
    
    const [alignment, setAlignment] = useState("phoneNumber")

    const navigate = useNavigate()

    useEffect(()=>{
        if(otpVerified){
           axios.post(logInByPhoneUrl+phoneNumber).
            then((res)=>{
                const decoded = jwtDecode(res.data.token, 'SECRET SALT')
                const user = decoded._doc
                user.token = res.data.token
                console.log(user)
                dispatch(authActions.setUser(user));
                dispatch(authActions.logIn()); 
                dispatch(dialogActions.close());
                localStorage.setItem("token", res.data.token);
                console.log("userLoggedIn")
                setOtpVerificationMessage("Logged In")
                dispatch(authActions.logIn())
                navigate("/profile")
            }).
            catch((err)=>{console.log(err)})
        }
    }, [otpVerified])
    
    const handleToogleChange = (event) => {
        setAlignment(event.target.value);
      };

    const paperStyle = {display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        alignContent:"baseline",
                        backgroundColor:'white'}
    
    const typographyStyle = {
                            fontFamily: 'monospace',
                            fontWeight: 700,
                           color: 'primary'}

    const checkUserExists = async()=>{
        let flag = false
        await axios.post(logInByPhoneUrl+phoneNumber).
                    then((res)=>{flag = true; dispatch(authActions.setUser(res.data))}).
                    catch((err)=>{flag = false})
        return flag
    }
    const handleOtpOnClick = async()=>{
        if(phoneNumber.length===0){
            setOtpVerificationMessage("please enter your number")
        }
        else if(phoneNumber.length<10){
            setOtpVerificationMessage("please enter 10 digit phone number")
        }
        else if(! await checkUserExists()){
            setOtpVerificationMessage("please register your number")
        }
        else{
            setOtpVerificationMessage()
            setShowOtpComponent(true)
        }
    }

    const handleLogIn = async()=>{
        await axios.post(logInByEmailUrl+emailId,{
            email:emailId,
            password:password
        }).then((res)=>{
                        setEmailVerificationMsg("");
                        const decoded = jwtDecode(res.data.token, 'SECRET SALT')
                        const user = decoded._doc
                        user.token = res.data.token
                        console.log(user)
                        dispatch(cartActions.modifyCart(user.cart))
                        dispatch(authActions.setUser(user));
                        dispatch(authActions.logIn()); 
                        dispatch(dialogActions.close());
                        localStorage.setItem("token", res.data.token);
                    }).
        catch((err)=>{console.log(err.response.data); setEmailVerificationMsg(err.response.data)})
    }

    return(<>
            <Box border={0} sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent:'center',
                alignItems:'center',
            }}>
                {/* <CloseTwoToneIcon  sx={{justifyContent:"center", alignItems:"center"}}></CloseTwoToneIcon> */}
                 
                <Stack border={0} direction='column' sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent:'center',
                alignItems:'center',
            }}>
                    <Typography variant="h3" m={1} sx={{fontFamily: 'monospace',
                    fontWeight: 700,
                    color:'dodgerblue',
                    alignContent:"center"}}>LogIn</Typography>
                     <Paper elevation={1} sx={{...paperStyle, width:'100%'}}>
                        <ToggleButtonGroup color='primary'
                                    value={alignment}
                                    exclusive
                                    onChange={handleToogleChange}
                                    aria-label="Platform"
                                    sx={{
                                        justifyContent:"center",
                                        alignItems:"center",
                                        width:"100%"
                                    }}>
                                <ToggleButton value="phoneNumber">Otp Verification</ToggleButton>
                                <ToggleButton value="email">Email Verification</ToggleButton>
                        </ToggleButtonGroup>
                     </Paper>
                    <Stack direction="column" m={2} width='100%' border={0} >
                    {alignment=="phoneNumber"?
                        <Paper elevation={1} sx={{...paperStyle, width:'100%', backgroundColor:'white'}}>
                            <Stack direction="column" display="flex" justifyContent="center" alignContent="center" sx={{width:"80%"}}>
                                {/* <Typography variant='button'  alignContent="center" sx={typographyStyle} m={1}>LogIn with your PhoneNumber</Typography> */}
                                {(!showOtpComponent) && <>
                                <TextField variant="standard" autoFocus label="PhoneNumber" name="phoneNumber" value={phoneNumber} onChange={(e)=>{setPhoneNumber(e.target.value)}} size="small" sx={{m:1}} required></TextField>
                                {/* <MuiPhoneNumber value={phoneNumber} label="PhoneNumber" defaultCountry={'in'} name="phoneNumber" onChange={(value)=>{setPhoneNumber(value)}} sx={{m:1}} required></MuiPhoneNumber> */}
                                <Button sx={{backgroundColor:'royalblue'}} onClick={()=>{handleOtpOnClick()}}><Typography variant="button" color='white'>Send OTP</Typography></Button></>}
                                {(showOtpComponent) &&<>
                                    <OtpVerificationComponent phoneNumber={phoneNumber} setOtpVerified={setOtpVerified} setOtpVerificationMessage={setOtpVerificationMessage} setShowOtpComponent={setShowOtpComponent}></OtpVerificationComponent>
                                    <Button onClick={()=>{setShowOtpComponent(false)}}>Change Number</Button>
                                </>}
                            {otpVerificationMessage}
                            </Stack>
                        </Paper>:
                        // <Divider>OR</Divider>
                        <Paper elevation={1} sx={{...paperStyle, width:'100%', backgroundColor:'white'}}> 
                            <Stack direction="column" display="flex" justifyContent="center" alignContent="center" sx={{width:"80%"}}>
                            {/* <Typography variant='button'  alignContent="center" sx={typographyStyle} m={1}>LogIn with your Email</Typography> */}
                                <TextField autoFocus label="Email" name="phoneNumber" value={emailId} onChange={(e)=>{setEmailId(e.target.value)}} size="small" sx={{m:1}}></TextField>
                                <TextField type="password" label="Password" name="password" value={password} onChange={(e)=>{setPassword(e.target.value)}} size="small" sx={{m:1}}></TextField>
                                 <Button sx={{backgroundColor:'royalblue'}} onClick={handleLogIn}><Typography variant="button" color='white'>LogIn</Typography></Button>
                                {emailVerificationMsg}
                            </Stack>
                        </Paper>}
                    </Stack>
                </Stack>
            </Box>
    </>)
}

export default LogIn