import React, { useEffect, useState } from 'react';
import ImgBox from '../../components/ImgBox/ImgBox';
import './ApplyDetail.css';
import { useNavigate } from 'react-router-dom';

import SuggestionBlock from './SuggestionBlock';
import SuggestionForm from './SuggestionForm';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useRecoilValue } from 'recoil';
import { memberIdAtom, memberTypeAtom } from '../../atom';
import ApplyList from '../../components/ApplyList/ApplyList';
import { Helmet } from 'react-helmet-async';

export default function ApplyDetail() {
    const { id } = useParams();

    const memberType = useRecoilValue(memberTypeAtom);
    const memberId = useRecoilValue(memberIdAtom);
    // const user_status = 2; // 전역으로 사용할 것임
    // const user_id = 4; // 전역으로 사용할 것임

    const [categoryOptions, setCategoryOptions] = useState([
        { category_code: 1, category_name: '최신순' },
        { category_code: 2, category_name: '최저가' },
        { category_code: 3, category_name: '이용횟수' },
    ]);
    const [selectedCartegory, setSelectedCartegory] = useState('');

    const moveUrl = useNavigate();

    const [apply, setApply] = useState({
        f_id: 0,
        u_id: 0,
        p_id: '',
        userName: '',
        f_category: '',
        f_date: '',
        f_dep_sido: '',
        f_dep_gungu: '',
        f_dep_ev: '',
        f_dep_ladder: '',
        f_arr_sido: '',
        f_arr_gungu: '',
        f_arr_ev: '',
        f_arr_ladder: '',
        f_room_video_url: '',
        f_req_desc: '',
        f_status: 0,
    });

    const [suggestion, setSuggestion] = useState({
        list: [],
    });

    // 처음 페이지 도착 시 실행 할 코드
    useEffect(() => {
        axios.get(`https://i9b301.p.ssafy.io/api/form/${id}`).then(res => {
            const importData = res.data.data;
            const newDesc = res.data.data.f_req_desc.split('\n').map((line, index) => (
                // 출력 시 태그 적용 코드
                <React.Fragment key={index}>
                    {line}
                    <br />
                </React.Fragment>
            ));
            res.data.data.f_req_desc = newDesc;
            setApply(importData);
            setSuggestion(importData);
            console.log(suggestion.list + ' ' + importData);
            suggestion.list
                .filter(element => element.p_id === memberId)
                .map(element => {
                    return setMySuggestion({
                        s_desc: element.s_desc,
                        s_money: element.s_money,
                    });
                });
        });
    }, [id, memberId]);

    const [mySuggestion, setMySuggestion] = useState({
        s_money: 0,
        s_desc: '',
    });

    const renderSelected = () => {
        return (
            <>
                <h2 className='left-align'>확정된 견적서</h2>
                {suggestion.list.length != 0 && (apply.f_status === 2 || apply.f_status === 3) ? (
                    suggestion.list
                        //신청서 날짜가 끝나서 완료로 바꼈는데
                        //확정한 견적서가 없는 경우
                        //filter가 null이라고 뜨길래 일단 주석처리함
                        .filter(element => element.is_selected === 't')
                        .map((element, index) => {
                            console.log('엔터어케나오나 확인' + element.s_desc);
                            // console.log('element:' + apply.f_id);
                            return <SuggestionBlock key={index} element={element} f_id={apply.f_id} p_id={apply.p_id} u_id={apply.u_id} />;
                        })
                ) : (
                    <div className='suggestion-block center-align'>확정된 견적서가 없습니다.</div>
                )}
            </>
        );
    };
    const handleCategoryChange = async categoryCode => {
        setSelectedCartegory(categoryCode);
        console.log(apply.f_id + ' ' + categoryCode);
        const response = await axios.get(`https://i9b301.p.ssafy.io/api/form/${apply.f_id}/${categoryCode}`);
        console.log(response);
        setSuggestion(response.data);
    };

    const renderAll = () => {
        return (
            <>
                <div className='sub-division'></div>
                <h2 className='apply-detail__suggestion-h2 left-align'>제안된 견적서</h2>
                <div className='filter-container'>
                    <div className='filter-status'>
                        {categoryOptions.map(option => (
                            <button
                                key={option.category_code}
                                className={selectedCartegory === option.category_code ? 'active category-btn' : 'category-btn'}
                                onClick={() => handleCategoryChange(option.category_code)}
                            >
                                <p className='paragraph'>{option.category_name}</p>
                            </button>
                        ))}
                    </div>
                </div>
                <div className='scoll-suggestion'>
                    {suggestion.list.length != 0 ? (
                        suggestion.list
                            // .filter(element => element.is_selected !== 't')
                            .map(element => {
                                return <SuggestionBlock element={element} f_id={apply.f_id} p_id={apply.p_id} u_id={apply.u_id} />;
                            })
                    ) : (
                        <div className='suggestion-block center-align'>작성된 견적서가 없습니다.</div>
                    )}
                </div>
            </>
        );
    };

    const renderSuggestionForm = () => {
        return (
            <>
                {
                    // 파트너인 경우
                    memberType === 'p' ? <SuggestionForm f_id={id} /> : null
                }
            </>
        );
    };

    const moverModifyHandler = () => {
        moveUrl('/apply-form', { state: { isModify: id } });
    };

    const renderSuggestionBtn = () => {
        return (
            <>
                {memberType === 'u' ? (
                    <div className='suggestion-block__btn-outer'>
                        <button className='btn-dynamic suggestion-block__btn' onClick={moverModifyHandler}>
                            수정하기
                        </button>
                        {/* <button className='btn-dynamic suggestion-block__btn' onClick={moverDeleteClickHandler}>삭제하기</button> */}
                    </div>
                ) : null}
            </>
        );
    };

    return (
        <div className='apply-detail'>
            <Helmet>
                <title>248 | 신청서 상세</title>
            </Helmet>
            {/* {console.log(apply)} */}
            {/* {console.log(`type${memberTypeAtom}`)} */}
            <ImgBox imgSrc='apply-detail' imgTitle='신청서 상세' />

            <section className='max-container section'>
                {/* [S] 요청 신청서 */}
                <div className='sec-two-one-container inner__section overlap-imgbox'>
                    <h2 className='sec-two-container__h2'>
                        "{apply.userName}"님 요청 신청서 <p className='sub'>{apply.f_status === 1 ? '입찰중' : apply.f_status === 2 ? '입찰 완료' : '이사 완료'}</p>
                    </h2>

                    <h4 className='sec-two-container__h4'>이사 종류</h4>
                    <p className='paragraph sec-two-container__paragraph'>{apply.f_category}</p>
                    <div className='sec-two-container__divide'></div>

                    <h4 className='sec-two-container__h4'>이사 날짜</h4>
                    <p className='paragraph sec-two-container__paragraph'>{apply.f_date}</p>
                    <div className='sec-two-container__divide'></div>

                    <h4 className='sec-two-container__h4'>출발 장소</h4>
                    <div className='apply-detail__location-div'>
                        <p className='paragraph sec-two-container__paragraph sec-two-container__paragraph-with-icon'>
                            {apply.f_dep_sido} {apply.f_dep_gungu}
                        </p>
                        <div>
                            {apply.f_dep_ev === 't' ? (
                                <img className='apply-detail__icon' src={require(`../../assets/image/icon/elevator.png`)} alt='img' />
                            ) : (
                                <img className='apply-detail__icon' src={require(`../../assets/image/icon/elevator-gray.png`)} alt='img' />
                            )}
                            {apply.f_dep_ladder === 't' ? (
                                <img className='apply-detail__icon' src={require(`../../assets/image/icon/ladder-truck.png`)} alt='img' />
                            ) : (
                                <img className='apply-detail__icon' src={require(`../../assets/image/icon/ladder-truck-gray.png`)} alt='img' />
                            )}
                        </div>
                    </div>
                    <div className='sec-two-container__divide'></div>

                    <h4 className='sec-two-container__h4'>도착 장소</h4>

                    <div className='apply-detail__location-div'>
                        <p className='paragraph sec-two-container__paragraph sec-two-container__paragraph-with-icon'>
                            {apply.f_arr_sido} {apply.f_arr_gungu}
                        </p>

                        <div>
                            {apply.f_arr_ev === 't' ? (
                                <img className='apply-detail__icon' src={require(`../../assets/image/icon/elevator.png`)} alt='img' />
                            ) : (
                                <img className='apply-detail__icon' src={require(`../../assets/image/icon/elevator-gray.png`)} alt='img' />
                            )}
                            {apply.f_arr_ladder === 't' ? (
                                <img className='apply-detail__icon' src={require(`../../assets/image/icon/ladder-truck.png`)} alt='img' />
                            ) : (
                                <img className='apply-detail__icon' src={require(`../../assets/image/icon/ladder-truck-gray.png`)} alt='img' />
                            )}
                        </div>
                    </div>

                    <div className='sec-two-container__divide'></div>

                    <h4 className='sec-two-container__h4'>자택 영상</h4>
                    <video className='sec-two-container__paragraph' src={apply.f_room_video_url} controls>
                        이 브라우저에서 지원하지 않는 영상입니다.
                    </video>
                    <div className='sec-two-container__divide'></div>

                    <h4 className='sec-two-container__h4'>무버 요청 사항</h4>
                    <p className='paragraph sec-two-container__paragraph'>{apply.f_req_desc}</p>
                    {renderSuggestionBtn()}
                </div>

                {/* [S] 견적서 */}
                <div className='sec-two-two-container inner__section'>
                    {/* 확정된 견적서 */}
                    {renderSelected()}
                    {/* 제안된 견적서 */}
                    {renderAll()}
                    {/* 견적서 작성 Form */}
                    {renderSuggestionForm()}
                    {/* HERE!!!!!! */}
                </div>
            </section>
        </div>
    );
}
