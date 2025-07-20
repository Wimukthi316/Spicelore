import React, { useState } from "react";
import Navbar from "../../components/user/Navbar";
import Footer from "../../components/user/Footer";

const RegistrationForm = () => {
    const [step, setStep] = useState(1);

    const nextStep = () => {
        if (step < 3) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    return (
        <div className="bg-white min-h-screen">
            <Navbar />

            <div className="text-center mt-30 py-10">
                <h3 className="text-gray-500 text-lg uppercase tracking-wide">
                    STUDENT ASSESSMENT & REGISTRATION FORM
                </h3>
                <h1 className="text-4xl md:text-4xl text-36px font-semibold text-black mt-2">
                    Start Your Study Abroad Journey With IGL Sri Lanka
                </h1>
                <p className="text-gray-600 text-sm md:text-bold mt-4 max-w-3xl mx-auto">
                    Fill Out This Quick Assessment To Check Your Eligibility And Take The First Step Toward Studying Abroad.
                    Our Experts Will Review Your Details And Guide You Through The Process!
                </p>
            </div>

            <div className="max-w-3xl mx-auto py-15 px-5">

                {/* Improved Step Indicator */}
                {/* Step Indicator */}
<div className="flex items-center justify-between mb-10 w-full px-2">
    {["Personal Information", "Academic Background", "Additional Information"].map((title, index) => (
        <div key={index} className="relative flex flex-col items-center flex-1">

            {/* Connecting Line */}
            {index > 0 && (
                <div 
                    className={`absolute top-4 w-full h-0.5 ${step > index ? "bg-black" : "bg-gray-300"}`}
                    style={{
                        right: '50%',
                        left: '-50%',
                        zIndex: 1
                    }}
                />
            )}

            {/* Step Circle */}
            <div className="relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                    ${step > index + 1 ? "bg-black border-black" : step === index + 1 ? "border-black" : "border-gray-300 bg-white"}`}>

                    {/* ✅ Step Status Logic */}
                    {step > index + 1 ? (
                        // Completed Step: Show Tick Mark
                        <span className="text-white text-xs">✓</span>
                    ) : (
                        // Current Step: Black Ball with Outer Border
                        <div className={`w-4 h-4 rounded-full transition-all duration-300
                            ${step === index + 1 ? "bg-black border border-black" : "bg-gray-300"}`} />
                    )}
                </div>
            </div>

            {/* Step Title */}
            <span className={`mt-2 text-center transition-all duration-300
                ${step === index + 1 ? "text-black font-semibold" : "text-gray-400"}
                text-xs sm:text-sm`}>
                {/* Always show step number on mobile */}
                <span className="sm:hidden">Step {index + 1}</span>
                {/* Full title on larger screens */}
                <span className="hidden sm:inline">{title}</span>
            </span>
        </div>
    ))}
</div>


                {/* Form Container */}
                <div className="bg-white p-6 sm:p-10 md:p-14 rounded-2xl border border-gray-300">
                    {step === 1 && (
                        <div className="space-y-4">
                            <label>Full Name *</label>
                            <input type="text" placeholder="Enter your full name" className="w-full border p-3 rounded-2xl" />

                            <label>Gender *</label>
                            <select className="w-full border p-3 rounded-2xl">
                                <option>Select Gender</option>
                                <option>Male</option>
                                <option>Female</option>
                            </select>

                            <label>Date of Birth *</label>
                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                                <input type="text" placeholder="Year" className="w-full sm:w-1/3 border p-3 rounded-2xl" />
                                <select className="w-full sm:w-1/3 border p-3 rounded-2xl">
                                    <option>Month</option>
                                </select>
                                <input type="text" placeholder="Date" className="w-full sm:w-1/3 border p-3 rounded-2xl" />
                            </div>

                            <label>Email Address *</label>
                            <input type="email" placeholder="Enter your email address" className="w-full border p-3 rounded-2xl" />

                            <label>Mobile Number *</label>
                            <input type="text" placeholder="Enter your mobile number" className="w-full border p-3 rounded-2xl" />

                            <label>Alternate Mobile Number</label>
                            <input type="text" placeholder="Enter your alternate mobile number" className="w-full border p-3 rounded-2xl" />

                            <label>Address *</label>
                            <input type="text" placeholder="Enter your address" className="w-full border p-3 rounded-2xl" />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <label>Highest Academic Qualification *</label>
                            <select className="w-full border p-3 rounded-2xl">
                                <option>Select Qualification</option>
                            </select>

                            <label>Other Special Qualifications *</label>
                            <textarea placeholder="Enter your special qualifications" className="w-full border p-3 rounded-2xl"></textarea>

                            <label>Fields of Interest for Study *</label>
                            <input type="text" placeholder="Enter your field of interest" className="w-full border p-3 rounded-2xl" />

                            <label>Preferred Study Destinations *</label>
                            <select className="w-full border p-3 rounded-2xl">
                                <option>Select Destination</option>
                            </select>

                            <label>English Competency Level</label>
                            <select className="w-full border p-3 rounded-2xl">
                                <option>Select Level</option>
                            </select>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <label>Message to IGL (If Any)</label>
                            <textarea placeholder="Enter your message" className="w-full border p-3 rounded-2xl"></textarea>
                            <div className="flex items-center space-x-2">
                                <input type="checkbox" className="w-5 h-5" />
                                <label className="text-sm">
                                    I Agree To Be Contacted By IGL Regarding My Study Abroad Application.
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                    {step > 1 ? (
                        <button onClick={prevStep} className="px-6 py-2 border rounded-md text-gray-600">
                            Previous
                        </button>
                    ) : (
                        <div></div> // Empty div to maintain spacing when there's no previous button
                    )}
                    {step < 3 ? (
                        <button onClick={nextStep} className="px-6 py-2 border rounded-md bg-black text-white">
                            Next Step →
                        </button>
                    ) : (
                        <button className="px-6 py-2 rounded-md bg-black text-white w-full sm:w-auto">
                            Get My Free Assessment
                        </button>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default RegistrationForm;