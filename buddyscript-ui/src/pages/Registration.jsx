
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../store/authSlice';

const Registration = () => {
    const [formData, setFormData] = useState({ email: '', password: '', first_name: '', last_name: '' });
    const { user, loading, error } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/feed');
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const action = await dispatch(registerUser(formData));
        if (action.meta.requestStatus === 'fulfilled') {
            navigate('/login');
        }
    };

    return (
        <React.Fragment>
            
	{/*Registration Section Start*/}
	<section className="_social_registration_wrapper _layout_main_wrapper">
		<div className="_shape_one">
			<img src="assets/images/shape1.svg" alt="" className="_shape_img" />
			<img src="assets/images/dark_shape.svg" alt="" className="_dark_shape" />
		</div>
		<div className="_shape_two">
			<img src="assets/images/shape2.svg" alt="" className="_shape_img" />
			<img src="assets/images/dark_shape1.svg" alt="" className="_dark_shape _dark_shape_opacity" />
		</div>
		<div className="_shape_three">
			<img src="assets/images/shape3.svg" alt="" className="_shape_img" />
			<img src="assets/images/dark_shape2.svg" alt="" className="_dark_shape _dark_shape_opacity" />
		</div>
		<div className="_social_registration_wrap">
			<div className="container">
				<div className="row align-items-center">
					<div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
						<div className="_social_registration_right">
							<div className="_social_registration_right_image">
								<img src="assets/images/registration.png" alt="Image" />
							</div>
							<div className="_social_registration_right_image_dark">
								<img src="assets/images/registration1.png" alt="Image" />
							</div>
						</div>
					</div>
					<div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
						<div className="_social_registration_content">
							<div className="_social_registration_right_logo _mar_b28">
								<img src="assets/images/logo.svg" alt="Image" className="_right_logo" />
							</div>
							<p className="_social_registration_content_para _mar_b8">Get Started Now</p>
							<h4 className="_social_registration_content_title _titl4 _mar_b50">Registration</h4>
							<button type="button" className="_social_registration_content_btn _mar_b40">
								<img src="assets/images/google.svg" alt="Image" className="_google_img" /> <span>Register with google</span>
							</button>
							<div className="_social_registration_content_bottom_txt _mar_b40"> <span>Or</span>
							</div>
							<form className="_social_registration_form" onSubmit={handleSubmit}>
                                {error && <div className="alert alert-danger">{typeof error === 'string' ? error : JSON.stringify(error)}</div>}
								<div className="row">
                                    <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
										<div className="_social_registration_form_input _mar_b14">
											<label className="_social_registration_label _mar_b8">First Name</label>
											<input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="form-control _social_registration_input" required />
										</div>
									</div>
                                    <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
										<div className="_social_registration_form_input _mar_b14">
											<label className="_social_registration_label _mar_b8">Last Name</label>
											<input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="form-control _social_registration_input" required />
										</div>
									</div>
									<div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
										<div className="_social_registration_form_input _mar_b14">
											<label className="_social_registration_label _mar_b8">Email</label>
											<input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control _social_registration_input" required />
										</div>
									</div>
									<div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
										<div className="_social_registration_form_input _mar_b14">
											<label className="_social_registration_label _mar_b8">Password</label>
											<input type="password" name="password" value={formData.password} onChange={handleChange} className="form-control _social_registration_input" required />
										</div>
									</div>
								</div>
								<div className="row">
									<div className="col-lg-12 col-xl-12 col-md-12 col-sm-12">
										<div className="form-check _social_registration_form_check">
											<input className="form-check-input _social_registration_form_check_input" type="checkbox" name="flexRadioDefault" id="flexRadioDefault2" required />
											<label className="form-check-label _social_registration_form_check_label" htmlFor="flexRadioDefault2">I agree to terms &amp; conditions</label>
										</div>
									</div>
								</div>
								<div className="row">
									<div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
										<div className="_social_registration_form_btn _mar_t40 _mar_b60">
											<button type="submit" className="_social_registration_form_btn_link _btn1" disabled={loading}>
                                                {loading ? 'Registering...' : 'Register now'}
                                            </button>
										</div>
									</div>
								</div>
							</form>
							<div className="row">
								<div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
									<div className="_social_registration_bottom_txt">
										<p className="_social_registration_bottom_txt_para">Already have an account? <a href="/login">Login</a>
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
	{/*Registration Section End*/}
	



        </React.Fragment>
    );
};

export default Registration;
