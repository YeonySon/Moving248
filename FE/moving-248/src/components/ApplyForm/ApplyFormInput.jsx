import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import RadioButton from './RadioButton';
import Checkbox from './Checkbox';
import './ApplyFormInput.css';
import LocationDropdown from './LocationDropdown';
import axios from 'axios';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { memberActiveApplyAtom, memberIdAtom } from '../../atom';
import { useLocation } from 'react-router-dom';

const ApplyFormInput = props => {
    const memberId = useRecoilValue(memberIdAtom);
    const setterActiveApply = useSetRecoilState(memberActiveApplyAtom);
    const location = useLocation();
    const isModify = location.state?.isModify;

    const [isChecked, setIsChecked] = useState({
        dep_ev: false,
        dep_ladder: false,
        arr_ev: false,
        arr_ladder: false,
    });

    const [selectedOption, setSelectedOption] = useState('');
    const [isMovingType, setIsMovingType] = useState(null);
    const [textareaValue, setTextareaValue] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [selectedDepSido, setSelectedDepSido] = useState(''); // 추가된 부분
    const [selectedDepGu, setSelectedDepGu] = useState(''); // 추가된 부분
    const [selectedArrSido, setSelectedArrSido] = useState(''); // 추가된 부분
    const [selectedArrGu, setSelectedArrGu] = useState(''); // 추가된 부분

    const [isSubmitting, setIsSubmitting] = useState(false);

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const [selectedDate, setSelectedDate] = useState(tomorrow);

    ////////////// 이 값이 숫자를 가지고 있으면 수정, 그게 아니면 신규 입력
    useEffect(() => {
        console.log('[ApplyForm] isModify : ' + isModify);
        // 신규 입력이면
        if (isModify === undefined) {
            return;
        }
        // 수정이면
        else {
            axios.get(`https://i9b301.p.ssafy.io/api/form/${isModify}`).then(res => {
                // 받아온 객체
                console.log(`이거는 is modify: ` + isModify);
                const importData = res.data.data;
                console.log(`[apply form]`);
                console.log(importData);
                console.log(`[apply form]importData.f_arr_ev : ${importData.f_arr_ev}`);
                /* @@@@@@@@@@@@@@@@@@@@@@@ 여기에서 수정 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  */

                // 이사종류
                setSelectedOption(importData.f_category == '포장이사' ? 'packing' : 'ordinary');
                setIsMovingType(importData.f_category == '포장이사' ? '1' : '2');
                setSelectedArrSido(importData.f_arr_sido_code);
                setSelectedArrGu(importData.f_arr_gungu_code);
                setSelectedDepSido(importData.f_dep_sido_code);
                setSelectedDepGu(importData.f_dep_gungu_code);
                // 엘리베이터, 사다리차 정보 가져오려고 만듬
                let updatedata = {
                    dep_ev: false,
                    dep_ladder: false,
                    arr_ev: false,
                    arr_ladder: false,
                };

                if (importData.f_dep_ev === 't') {
                    updatedata.dep_ev = true;
                } else {
                    updatedata.dep_ev = false;
                }
                if (importData.f_dep_ladder === 't') {
                    updatedata.dep_ladder = true;
                } else {
                    updatedata.dep_ladder = false;
                }
                if (importData.f_arr_ev === 't') {
                    updatedata.arr_ev = true;
                } else {
                    updatedata.arr_ev = false;
                }
                if (importData.f_arr_ladder === 't') {
                    updatedata.arr_ladder = true;
                } else {
                    updatedata.arr_ladder = false;
                }

                setIsChecked({
                    dep_ev: updatedata.dep_ev,
                    dep_ladder: updatedata.dep_ladder,
                    arr_ev: updatedata.arr_ev,
                    arr_ladder: updatedata.arr_ladder,
                });

                const parseDate = new Date(importData.f_date);
                setSelectedDate(parseDate);

                setImageSrc(importData.f_room_video_url);

                setTextareaValue(importData.f_req_desc);
                setCharacterCount(importData.f_req_desc.length);

                // console.log(selectedDate);
                /* @@@@@@@@@@@@@@@@@@@@@@@ 여기에서 수정 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  */
            });
        }
    }, [isModify]);

    const handleCheckboxChange = key => {
        setIsChecked(prevState => ({
            ...prevState,
            [key]: !prevState[key],
        }));
    };

    const handleRadioChange = value => {
        setSelectedOption(value);
        setIsMovingType(value === 'packing' ? '1' : value === 'ordinary' ? '2' : null);
    };

    const handleDateChange = date => {
        setSelectedDate(date);
        console.log(selectedDate);
    };
    const formatDate = date => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const handleTextareaChange = event => {
        setTextareaValue(event.target.value);
        setCharacterCount(event.target.value.length);
    };
    const radioOptions = [
        { label: '포장이사', value: 'packing' },
        { label: '일반이사', value: 'ordinary' },
    ];

    const [file, setFile] = useState(null);

    const [characterCount, setCharacterCount] = useState(0);

    // const handleFileChange = event => {
    //     setFile(event.target.files[0]);
    // };

    const [imageSrc, setImageSrc] = useState('');

    const handleFileChange = event => {
        const selectedFile = event.target.files[0];

        // Check if a file was selected
        if (!selectedFile) {
            setFile(null);
            setImageSrc('');
            return;
        }

        // Check if the selected file is a video
        if (!selectedFile.type.includes('video')) {
            alert('허용되지 않는 파일 형식입니다.');
            setImageSrc('');
            return;
        }

        setFile(selectedFile);

        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);

        reader.onload = () => {
            setImageSrc(reader.result);
        };
    };

    const handleSubmit = async event => {
        event.preventDefault();
        if (!isMovingType) {
            setErrorMessage('이사 종류를 선택해주세요.');
            return;
        }

        if (!selectedDepSido || !selectedDepGu) {
            setErrorMessage('출발 장소를 선택해주세요.');
            return;
        }

        if (!selectedArrSido || !selectedArrGu) {
            setErrorMessage('도착 장소를 선택해주세요.');
            return;
        }
        if (!file) {
            setErrorMessage('파일을 선택해주세요.');
            if (imageSrc) {
            } else {
                return;
            }
        }
        setErrorMessage('');

        const formData = new FormData();
        formData.append('file', file);
        const jsonData = {
            m_id: memberId, //int
            f_category: isMovingType, // string으로
            f_date: formatDate(selectedDate),
            f_dep_ev: isChecked.dep_ev ? 't' : 'f', // char T F
            f_dep_ladder: isChecked.dep_ladder ? 't' : 'f',
            f_arr_ev: isChecked.arr_ev ? 't' : 'f',
            f_arr_ladder: isChecked.arr_ladder ? 't' : 'f',
            f_req_desc: textareaValue, //String
            f_dep_sido: selectedDepSido, //String  '1'
            f_dep_gungu: selectedDepGu, //String  '34'
            f_arr_sido: selectedArrSido, //String  '2'
            f_arr_gungu: selectedArrGu, //String  '22'
        };

        formData.append(
            'data',
            new Blob([JSON.stringify(jsonData)], {
                type: 'application/json',
            })
        );
        // 제출이 진행 중임을 나타내기 위해 isSubmitting을 true로 설정
        setIsSubmitting(true);

        // 신규 작성
        if (isModify === undefined) {
            try {
                const response = await axios.post('https://i9b301.p.ssafy.io/api/form', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                console.log('서버 응답:', response.data);
                setterActiveApply('t');
                alert('신청서 작성이 완료되었습니다.');
                window.location.href = '/';
            } catch (error) {
                console.error('신규 작성 에러 발생:', error);
            } finally {
                // 요청이 완료된 후에 isSubmitting을 false로 재설정
                setIsSubmitting(false);
            }
        }
        // 수정
        else {
            try {
                console.log(isModify);
                const response = await axios.put(`https://i9b301.p.ssafy.io/api/form/${isModify}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                console.log('서버 응답:', response.data);
                setterActiveApply('t');
                alert('신청서 수정이 완료되었습니다.');
                window.location.href = '/';
            } catch (error) {
                alert('신청서 수정 에러 발생');
                console.error('수정 에러 발생:', error);
            } finally {
                // 요청이 완료된 후에 isSubmitting을 false로 재설정
                setIsSubmitting(false);
            }
        }
    };

    return (
        <>
            {/* 로딩 오버레이 */}
            {isSubmitting && (
                <div className='loading-overlay'>
                    <div className='spinner'></div>
                </div>
            )}
            <section className='max-container section'>
                <div className='sec-two-one-container inner__section  overlap-imgbox'>
                    <h2 className='sec-two-container__h2 sec-two-container__h2-form'>이사 신청서</h2>
                    <a href='#explanation' className='explanation paragraph'>
                        ※ 신청서 작성법은 해당 문구를 눌러 확인해주세요.
                    </a>
                    <div className='apply-form-innerbox'>
                        <h4 className='sec-two-container__h4'>이사 종류</h4>
                        <RadioButton options={radioOptions} selectedOption={selectedOption} onChange={handleRadioChange} />
                    </div>
                    <div className='sec-two-container__divide'></div>

                    <div className='apply-form-innerbox'>
                        <h4 className='sec-two-container__h4'>날짜 선택</h4>
                        <div className=' apply-form__padding'>
                            <DatePicker
                                dateFormat='yyyy-MM-dd' // 날짜 형태
                                shouldCloseOnSelect // 날짜를 선택하면 datepicker가 자동으로 닫힘
                                minDate={tomorrow} // minDate 이전 날짜 선택 불가
                                selected={selectedDate}
                                onChange={handleDateChange}
                                className='date-picker'
                            />
                        </div>
                    </div>
                    <div className='sec-two-container__divide'></div>

                    <div className='apply-form-innerbox'>
                        <h4 className='sec-two-container__h4'>출발 주소</h4>
                        <LocationDropdown label='출발' selectedSido={selectedDepSido} setSelectedSido={setSelectedDepSido} selectedGu={selectedDepGu} setSelectedGu={setSelectedDepGu} />
                        <div className='apply-form__padding'>
                            <Checkbox name='dep_ev' checked={isChecked.dep_ev} onChange={() => handleCheckboxChange('dep_ev')} onClick={() => handleCheckboxChange('dep_ev')} />
                            <label className='paragraph' onClick={() => handleCheckboxChange('dep_ev')}>
                                엘리베이터 사용
                            </label>
                        </div>
                        <div className='apply-form__padding'>
                            <Checkbox name='dep_ladder' checked={isChecked.dep_ladder} onChange={() => handleCheckboxChange('dep_ladder')} onClick={() => handleCheckboxChange('dep_ladder')} />
                            <label className='paragraph' onClick={() => handleCheckboxChange('dep_ladder')}>
                                사다리차 사용
                            </label>
                        </div>
                    </div>
                    <div className='sec-two-container__divide'></div>

                    <div className='apply-form-innerbox'>
                        <h4 className='sec-two-container__h4'>도착 주소</h4>
                        <LocationDropdown label='도착' selectedSido={selectedArrSido} setSelectedSido={setSelectedArrSido} selectedGu={selectedArrGu} setSelectedGu={setSelectedArrGu} />
                        <div className='apply-form__padding'>
                            <Checkbox name='arr_ev' checked={isChecked.arr_ev} onChange={() => handleCheckboxChange('arr_ev')} onClick={() => handleCheckboxChange('arr_ev')} />
                            <label className='paragraph' onClick={() => handleCheckboxChange('arr_ev')}>
                                엘리베이터 사용
                            </label>
                        </div>
                        <div className='apply-form__padding'>
                            <Checkbox name='arr_ladder' checked={isChecked.arr_ladder} onChange={() => handleCheckboxChange('arr_ladder')} onClick={() => handleCheckboxChange('arr_ladder')} />
                            <label className='paragraph' onClick={() => handleCheckboxChange('arr_ladder')}>
                                사다리차 사용
                            </label>
                        </div>
                    </div>
                    <div className='sec-two-container__divide'></div>

                    <h4 className='sec-two-container__h4'>자택 정보</h4>
                    <div className='apply-form-innerbox'>
                        {/* 파일 선택 폼 */}
                        <div className='apply-form__padding'>
                            <input type='file' accept='video/*' onChange={handleFileChange} />
                        </div>
                        {imageSrc ? <video className='apply-form__video' src={imageSrc} controls></video> : <div></div>}

                        {/* <div className='preview'>{imageSrc && <img src={imageSrc} alt='preview-img' />}</div> */}
                    </div>
                    <div className='sec-two-container__divide'></div>

                    <div className='apply-form-innerbox'>
                        <h4 className='sec-two-container__h4'>요청사항</h4>
                        <textarea
                            className='apply-form-desc'
                            type='textarea'
                            name='apply-form-desc'
                            value={textareaValue}
                            onChange={handleTextareaChange}
                            maxLength={255}
                            placeholder='ex) 매트리스 커버는 새걸로 부탁드립니다.'
                        ></textarea>
                        <div className='character-count sub'>{characterCount}/255</div>
                    </div>
                    {/* </div> */}
                    {/* <div className='form-submit-button'> */}
                    <div className='sec-two-container__divide last-divide'></div>

                    <button className='btn-static' type='button' onClick={handleSubmit}>
                        {isModify === undefined ? '신청서 등록' : '신청서 수정'}
                    </button>
                    <div className='apply-form-innerbox-e'>{errorMessage && <p className='form-error-message dynamic pad-top-05'>{errorMessage}</p>}</div>
                </div>

                <div className='sec-two-two-container inner__section' id='explanation'>
                    <div className='suggestion-block center-align'>
                        <div>
                            <h2 className='left-align faq'>FAQ</h2>
                            <h5 className='left-align'>포상이사와 일반이사는 뭐가 다른가요?</h5>
                            <p className='apply-form__right-inner-p left-align dynamic'>
                                포장이사는 포장부터 운송, 짐 배치까지 파트너가 모두 도와주는 서비스입니다. <br />
                                일반이사는 운송만 도와주고 포장, 짐 정리는 스스로 하는 서비스입니다.
                                <br />
                            </p>
                            <h5 className='left-align'>상세 주소는 입력하지 않아도 되나요?</h5>
                            <p className='apply-form__right-inner-p left-align dynamic'>
                                네! 고객의 개인정보 보호를 위해 신청서 작성 시에는 상세 주소를 입력하지 않습니다.
                                <br />
                                후에 파트너 확정 후 상세 주소를 파트너에게 공유하면 됩니다.
                                <br />
                            </p>
                            <h5 className='left-align'>동영상 꼭 찍어서 올려야 하나요?</h5>
                            <p className='apply-form__right-inner-p left-align dynamic'>
                                네! 저희 248 서비스는 직접 방문하는 대신 영상 속 정보를 통해 견적을 작성하기 때문에 영상정보가 꼭 필요합니다.
                                <br />
                            </p>
                        </div>
                    </div>
                    <div className='sec-two-container__divide'></div>
                    <h2 className='left-align'>동영상 촬영 가이드</h2>
                    <video className='help-video' src={imageSrc} controls></video>
                    <div className='suggestion-block center-align'>
                        <div>
                            <h5 className='left-align'>동영상 촬영 TIP</h5>
                            <p className='movie-p left-align dynamic'>
                                - 큰 가구들 위주로 보여주세요.
                                <br />
                            </p>
                            <p className='movie-p left-align dynamic'>
                                - 가구 안에 짐이 많다면 짐도 같이 보여주세요.
                                <br />
                            </p>
                            <p className='movie-p left-align dynamic'>- 문의 크기와 창문의 크기가 잘 보이도록 촬영해 주세요.</p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ApplyFormInput;
