import { useFile } from '../common/Context';
import "./GuestPage.css"


const GuestPage = () => {
  const { files } = useFile();

  return (
    <div className="GuestMainSection">
      {files.length === 0 ? (
        <p style={{textAlign: 'center', color: '#999', marginTop: '50px'}}>
          <br/>+ 생성 버튼을 눌러 링크 추가 
        </p>
      ) : (
        files.map(file => (
          <a
            key={file.id}
            href={file.url}
            target='_blank'
            rel='noopener noreferrer'
            className='block'
          >
          <div key={file.id} className="FileBox">
            <div className="FileIcon"></div>
            <p>{file.title}</p>
            {/* <small style={{wordBreak: 'break-all'}}>{file.url}</small> */}
          </div>
          </a>
        ))
      )}
    </div>
  );
};

export default GuestPage;