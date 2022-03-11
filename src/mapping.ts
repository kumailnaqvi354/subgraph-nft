import {Transfer as TransferEvent, Token as TokenContract} from '../generated/Token/Token';
import {Token,User} from '../generated/schema';
import { ipfs, json } from "@graphprotocol/graph-ts";

const ipfsHash = 'QmSr3vdMuP2fSxWD7S26KzzBWcAN1eNhm4hk1qaR3x3vmj';

export function handleTransfer(event: TransferEvent): void{
  let token  =  Token.load(event.params.tokenId.toString());

  if(!token){
    token = new Token(event.params.tokenId.toString());
    token.tokenID =  event.params.tokenId;

    token.tokenURI = "/" + event.params.tokenId.toString() + '.json';

    let  metadata = ipfs.cat(ipfsHash + token.tokenURI);

    if (metadata) {
      const value = json.fromBytes(metadata).toObject();
      if(value){
        const image = value.get('image');
        const name = value.get('name');
        const description = value.get('description');
        const externalURI = value.get('external_url');
        if (name && image && description && externalURI) {
            token.image = image.toString();
            token.description = description.toString();
            token.name = name.toString();
            token.externalURL = externalURI.toString();
            token.ipfsURI = 'ipfs.io/ipfs' + ipfsHash + token.tokenURI;
          }
          const coven = value.get('coven');
            if(coven){
              let covenData = coven.toObject();
              const type = covenData.get('type');
              if(type){
                token.type = type.toString();
              } 
              const birthChart = covenData.get('birthChart');
              if(birthChart){
                let birthChartData = birthChart.toObject();
                const sun = birthChartData.get('sun');
                const moon = birthChartData.get('moon');
                const rising = birthChartData.get('rising');
              if(sun && moon && rising){
                token.sun = sun.toString();
                token.moon = moon.toString();
                token.rising = rising.toString();
              }
              }
              
            }


      }
    }
  }

  token.updatedAtTimeStamp = event.block.timestamp;
  token.owner = event.params.to.toHexString();
  token.save();
  }